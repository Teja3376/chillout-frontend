"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useSocket } from "./SocketProvider";
import { Socket } from "socket.io-client";

interface CallContextType {
  isInCall: boolean;
  joinCall: () => void;
  leaveCall: () => void;
  participants: string[]; // List of usernames
  localStream: MediaStream | null;
  isMuted: boolean;
  toggleMute: () => void;
}

const CallContext = createContext<CallContextType | null>(null);

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCall must be used within a CallProvider");
  }
  return context;
};

interface CallProviderProps {
  children: React.ReactNode;
  roomId: string;
  username: string;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:global.stun.twilio.com:3478" },
  ],
};

export const CallProvider: React.FC<CallProviderProps> = ({
  children,
  roomId,
  username,
}) => {
  const socket = useSocket();
  const [isInCall, setIsInCall] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState(false);

  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map());
  // To keep track of usernames associated with socketIds
  const peerUsernamesRef = useRef<Map<string, string>>(new Map());

  // Helper to add a participant to the list if not already there
  const addParticipant = useCallback((name: string) => {
    setParticipants((prev) => {
      if (prev.includes(name)) return prev;
      return [...prev, name];
    });
  }, []);

  const removeParticipant = useCallback((name: string) => {
    setParticipants((prev) => prev.filter((p) => p !== name));
  }, []);

  const createPeerConnection = useCallback(
    (socketId: string, stream: MediaStream, remoteUsername: string) => {
      const pc = new RTCPeerConnection(ICE_SERVERS);
      peersRef.current.set(socketId, pc);
      peerUsernamesRef.current.set(socketId, remoteUsername);
      addParticipant(remoteUsername);

      // Add local tracks to the connection
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice_candidate", {
            to: socketId,
            candidate: event.candidate,
          });
        }
      };

      // Handle remote stream
      pc.ontrack = (event) => {
        const remoteStream = event.streams[0];
        remoteStreamsRef.current.set(socketId, remoteStream);
        
        // Create a new audio element for this peer
        const audio = document.createElement("audio");
        audio.srcObject = remoteStream;
        audio.autoplay = true;
        audio.id = `audio-${socketId}`;
        document.body.appendChild(audio);
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
            cleanupPeer(socketId);
        }
      };

      return pc;
    },
    [socket, addParticipant]
  );

  const cleanupPeer = useCallback((socketId: string) => {
    const pc = peersRef.current.get(socketId);
    if (pc) {
      pc.close();
      peersRef.current.delete(socketId);
    }
    
    const username = peerUsernamesRef.current.get(socketId);
    if (username) {
      removeParticipant(username);
      peerUsernamesRef.current.delete(socketId);
    }

    const audioEl = document.getElementById(`audio-${socketId}`);
    if (audioEl) {
      audioEl.remove();
    }
    
    remoteStreamsRef.current.delete(socketId);
  }, [removeParticipant]);

  const joinCall = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setLocalStream(stream);
      setIsInCall(true);
      addParticipant(username); // Add self

      socket.emit("join_call", { roomId, username });
      
      // Persist call state
      sessionStorage.setItem('inCall_roomId', roomId);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please allow permissions.");
    }
  }, [roomId, username, socket, addParticipant]);

  const leaveCall = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    socket.emit("leave_call", { roomId, username });
    setIsInCall(false);
    setParticipants([]);
    setIsMuted(false);

    // Close all peer connections
    peersRef.current.forEach((pc, socketId) => {
        cleanupPeer(socketId);
    });
    peersRef.current.clear();
    peerUsernamesRef.current.clear();
    remoteStreamsRef.current.clear();

    // Clear persisted call state
    sessionStorage.removeItem('inCall_roomId');

  }, [localStream, roomId, username, socket, cleanupPeer]);

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // Auto-rejoin if persisted state exists
  useEffect(() => {
    const savedRoomId = sessionStorage.getItem('inCall_roomId');
    if (savedRoomId === roomId && !isInCall && socket) {
      console.log("Restoring call session...");
      joinCall();
    }
  }, [roomId, socket, isInCall, joinCall]);

  useEffect(() => {
    if (!socket || !localStream) return;

    const handleUserJoinedCall = async ({ socketId, username: remoteUsername }: { socketId: string, username: string }) => {
      console.log("User joined call:", remoteUsername);
      const pc = createPeerConnection(socketId, localStream, remoteUsername);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("offer", { to: socketId, offer });
    };

    const handleOffer = async ({ from, offer }: { from: string; offer: RTCSessionDescriptionInit }) => {
        // We might not know the username yet if we just joined and received an offer immediately
        // But for now let's assume we can handle it or just display "Unknown" until we sync
        // Ideally the offer should contain metadata or we fetch it. 
        // For simplicity, we'll just use the socketId as a placeholder if needed, 
        // but usually 'join_call' happens first or we need a way to map socketId to user.
        // In this simple implementation, the 'offer' event doesn't carry username.
        // We can fetch it or just wait.
        // Let's modify the backend to send username with offer/answer if possible?
        // Or just rely on the fact that we might have received 'user_joined_call' before?
        // Actually, if *I* join, existing users send me offers. I don't know their usernames yet.
        // Let's assume for now we just show "User" or modify backend to send username in offer.
        // I'll modify the backend to send username in offer/answer for better UX, 
        // BUT for now let's just use a generic name if missing or try to find it.
        
        // Wait, if I join, I emit 'join_call'. 
        // Existing users receive 'join_call', create peer, send 'offer'.
        // I receive 'offer'. I need to create peer and answer.
        
        // To get the username of the offerer, we can pass it in the offer payload from the sender side.
        // I'll update the frontend logic to send username in the offer payload wrapper.
        
        console.log("Received offer from:", from);
    };
    
    // We need to handle the signaling logic carefully.
    // Let's refine the socket listeners below.

    return () => {
      socket.off("user_joined_call");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice_candidate");
      socket.off("user_left_call");
    };
  }, [socket, localStream, createPeerConnection]);

  // Separate useEffect for setting up listeners that depend on localStream
  useEffect(() => {
      if(!socket) return;

      socket.on("user_joined_call", async ({ socketId, username: remoteUsername }) => {
          if (!localStream) return; // Should be in call
          console.log("User joined:", remoteUsername);
          const pc = createPeerConnection(socketId, localStream, remoteUsername);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          // Send username with offer so the receiver knows who we are
          socket.emit("offer", { to: socketId, offer, username: username }); 
      });

      socket.on("offer", async ({ from, offer, username: remoteUsername }) => {
          if (!localStream) return;
          console.log("Received offer from:", remoteUsername);
          const pc = createPeerConnection(from, localStream, remoteUsername || "Unknown");
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("answer", { to: from, answer, username: username });
      });

      socket.on("answer", async ({ from, answer }) => {
          const pc = peersRef.current.get(from);
          if (pc) {
              await pc.setRemoteDescription(new RTCSessionDescription(answer));
          }
      });

      socket.on("ice_candidate", async ({ from, candidate }) => {
          const pc = peersRef.current.get(from);
          if (pc) {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
      });

      socket.on("user_left_call", ({ socketId }) => {
          cleanupPeer(socketId);
      });

      return () => {
          socket.off("user_joined_call");
          socket.off("offer");
          socket.off("answer");
          socket.off("ice_candidate");
          socket.off("user_left_call");
      };
  }, [socket, localStream, createPeerConnection, cleanupPeer, username]);


  return (
    <CallContext.Provider
      value={{
        isInCall,
        joinCall,
        leaveCall,
        participants,
        localStream,
        isMuted,
        toggleMute,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};
