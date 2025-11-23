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

interface CallContextType {
  isInCall: boolean;

  leaveCall: () => void;
  participants: string[]; // List of usernames
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  peerUsernames: Map<string, string>; // Map socketId -> username
  isMuted: boolean;
  isVideoEnabled: boolean;
  toggleMute: () => void;
  toggleVideo: () => void;
  toggleCamera: () => void;
  joinCall: (withVideo?: boolean) => void;
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
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [peerUsernames, setPeerUsernames] = useState<Map<string, string>>(new Map());

  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
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
      // peerUsernamesRef.current.set(socketId, remoteUsername);
      setPeerUsernames((prev) => {
          const newMap = new Map(prev);
          newMap.set(socketId, remoteUsername);
          return newMap;
      });
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
        
        setRemoteStreams((prev) => {
            const newMap = new Map(prev);
            newMap.set(socketId, remoteStream);
            return newMap;
        });

        // Create a new audio element for this peer if it doesn't exist (for audio playback)
        // Video elements will be handled in the UI component
        let audio = document.getElementById(`audio-${socketId}`) as HTMLAudioElement;
        if (!audio) {
            audio = document.createElement("audio");
            audio.id = `audio-${socketId}`;
            document.body.appendChild(audio);
        }
        audio.srcObject = remoteStream;
        audio.autoplay = true;
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
    
    // const username = peerUsernamesRef.current.get(socketId);
    // if (username) {
    //   removeParticipant(username);
    //   peerUsernamesRef.current.delete(socketId);
    // }
    
    setPeerUsernames((prev) => {
        const username = prev.get(socketId);
        if (username) {
            removeParticipant(username);
        }
        const newMap = new Map(prev);
        newMap.delete(socketId);
        return newMap;
    });

    const audioEl = document.getElementById(`audio-${socketId}`);
    if (audioEl) {
      audioEl.remove();
    }
    
    setRemoteStreams((prev) => {
        const newMap = new Map(prev);
        newMap.delete(socketId);
        return newMap;
    });
  }, [removeParticipant]);

  const joinCall = useCallback(async (withVideo: boolean = false) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: true, 
          video: withVideo ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" } : false 
      });
      setLocalStream(stream);
      setIsInCall(true);
      setIsVideoEnabled(withVideo);
      addParticipant(username); // Add self

      socket.emit("join_call", { roomId, username });
      
      // Persist call state
      sessionStorage.setItem('inCall_roomId', roomId);
    } catch (error) {
      console.error("Error accessing media devices:", error);
      alert("Could not access microphone/camera. Please allow permissions.");
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
    peersRef.current.clear();
    // peerUsernamesRef.current.clear();
    setPeerUsernames(new Map());
    setRemoteStreams(new Map());

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

  const toggleVideo = async () => {
      if (localStream) {
          const videoTrack = localStream.getVideoTracks()[0];
          
          if (videoTrack) {
              // If we already have a video track, just toggle it
              videoTrack.enabled = !videoTrack.enabled;
              setIsVideoEnabled(videoTrack.enabled);
          } else {
              // If we don't have a video track (started as audio-only), we need to get one
              try {
                  const videoStream = await navigator.mediaDevices.getUserMedia({ 
                      video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" } 
                  });
                  const newVideoTrack = videoStream.getVideoTracks()[0];
                  
                  localStream.addTrack(newVideoTrack);
                  setIsVideoEnabled(true);

                  // Add this new track to all existing peer connections
                  peersRef.current.forEach((pc) => {
                      pc.addTrack(newVideoTrack, localStream);
                  });
                  
                  // Simple renegotiation trigger for all peers
                  peersRef.current.forEach(async (pc, socketId) => {
                      const offer = await pc.createOffer();
                      await pc.setLocalDescription(offer);
                      socket.emit("offer", { to: socketId, offer, username });
                  });
                  


              } catch (error) {
                  console.error("Error enabling video:", error);
                  alert("Could not access camera.");
              }
          }
      }
  };

  const toggleCamera = async () => {
    if (!localStream || !isVideoEnabled) return;

    const videoTrack = localStream.getVideoTracks()[0];
    if (!videoTrack) return;

    const currentFacingMode = videoTrack.getSettings().facingMode;
    const newFacingMode = currentFacingMode === "user" ? "environment" : "user";

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: newFacingMode } }
      });
      const newVideoTrack = newStream.getVideoTracks()[0];

      // Replace track in local stream
      localStream.removeTrack(videoTrack);
      localStream.addTrack(newVideoTrack);
      
      // Stop old track
      videoTrack.stop();

      // Replace track in all peer connections
      peersRef.current.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender) {
          sender.replaceTrack(newVideoTrack);
        }
      });

      // Force re-render to update local video view
      setLocalStream(new MediaStream(localStream.getTracks()));

    } catch (error) {
      console.error("Error switching camera:", error);
      // Fallback to non-exact constraint if exact fails
      try {
          const newStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: newFacingMode }
          });
          const newVideoTrack = newStream.getVideoTracks()[0];
          
           // Replace track in local stream
          localStream.removeTrack(videoTrack);
          localStream.addTrack(newVideoTrack);
          videoTrack.stop();

          peersRef.current.forEach((pc) => {
            const sender = pc.getSenders().find((s) => s.track?.kind === "video");
            if (sender) {
              sender.replaceTrack(newVideoTrack);
            }
          });
          setLocalStream(new MediaStream(localStream.getTracks()));
      } catch (fallbackError) {
          console.error("Fallback camera switch failed:", fallbackError);
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
        console.log("Received offer from:", from);
    };
    
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
        remoteStreams,
        peerUsernames,
        isMuted,
        isVideoEnabled,
        toggleMute,
        toggleVideo,
        toggleCamera,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};
