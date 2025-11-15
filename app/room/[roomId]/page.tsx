"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useParams } from "next/navigation";
import {
  useSocket,
  useOnlineUsers,
  SOCKET_URL,
} from "@/components/SocketProvider";
import HeaderBar from "@/components/HeaderBar";
import MessageBubble from "@/components/MessageBubble";
import InputBar from "@/components/InputBar";
import OnlineUsersModal from "@/components/OnlineUsersModal";
import { useGetRoom } from "@/lib/hooks";
import { roomApi } from "@/lib/apiClient";

export default function RoomPage() {
  const { roomId } = useParams() as { roomId: string };
  const searchParams = useSearchParams();
  const username = searchParams.get("username") || "anonymous";
  const socket = useSocket();
  const onlineUsers = useOnlineUsers(roomId as string);
  const { data: roomData } = useGetRoom(roomId as string);

  const [messages, setMessages] = useState<
    { username: string; message: string; type?: string; url?: string }[]
  >([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<{
    index: number | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
  }>({ index: null, isPlaying: false, currentTime: 0, duration: 0 });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (roomData) {
      setMessages(
        roomData.messages.map(
          (msg: {
            username: string;
            message: string;
            type?: string;
            url?: string;
          }) => ({
            ...msg,
            url: msg.url
              ? msg.url.startsWith("http")
                ? msg.url
                : `${SOCKET_URL}${msg.url}`
              : undefined,
          })
        )
      );
    }
  }, [roomData]);

  useEffect(() => {
    socket.emit("join_room", { roomId, username });

    socket.on(
      "receive_message",
      (data: {
        username: string;
        message: string;
        type?: string;
        url?: string;
      }) => {
        setMessages((prev) => [...prev, data]);
        setTimeout(() => {
          const lastMessage = document.querySelector(
            ".message-bubble:last-child"
          ) as HTMLElement;
          if (lastMessage) {
            lastMessage.style.transform = "scale(0.8)";
            lastMessage.style.opacity = "0";
            setTimeout(() => {
              lastMessage.style.transition = "all 0.5s ease-out";
              lastMessage.style.transform = "scale(1)";
              lastMessage.style.opacity = "1";
            }, 50);
          }
        }, 100);
      }
    );

    socket.on(
      "receive_voice_message",
      (data: {
        username: string;
        message: string;
        type?: string;
        url?: string;
      }) => {
        setMessages((prev) => [
          ...prev,
          {
            ...data,
            url: data.url
              ? data.url.startsWith("http")
                ? data.url
                : `${SOCKET_URL}${data.url}`
              : undefined,
          },
        ]);
        setTimeout(() => {
          const lastMessage = document.querySelector(
            ".message-bubble:last-child"
          ) as HTMLElement;
          if (lastMessage) {
            lastMessage.style.transform = "scale(0.8)";
            lastMessage.style.opacity = "0";
            setTimeout(() => {
              lastMessage.style.transition = "all 0.5s ease-out";
              lastMessage.style.transform = "scale(1)";
              lastMessage.style.opacity = "1";
            }, 50);
          }
        }, 100);
      }
    );

    return () => {
      socket.off("receive_message");
      socket.off("receive_voice_message");
    };
  }, [socket, roomId, username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim() === "") return;
    socket.emit("send_message", { roomId, username, message: newMessage });
    setNewMessage("");
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      setIsRecording(true);

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e: BlobEvent) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setRecordedBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const previewVoiceMessage = () => {
    if (recordedBlob) {
      const audioUrl = URL.createObjectURL(recordedBlob);
      const audio = new Audio(audioUrl);
      setIsPreviewing(true);
      audio.onended = () => {
        setIsPreviewing(false);
        URL.revokeObjectURL(audioUrl);
      };
      audio.play();
    }
  };

  const sendRecordedVoiceMessage = async () => {
    if (recordedBlob) {
      await sendVoiceMessage(recordedBlob);
      setRecordedBlob(null);
    }
  };

  const sendVoiceMessage = async (voiceBlob: Blob) => {
    try {
      const response = await roomApi.uploadVoice(
        roomId as string,
        username,
        voiceBlob
      );
      socket.emit("send_voice_message", {
        roomId,
        username,
        url: `${SOCKET_URL}${response.url}`,
      });
    } catch (error) {
      console.error("Error sending voice message:", error);
    }
  };

  const playVoiceMessage = (index: number, url: string) => {
    if (playingAudio.index === index) {
      if (audioRef.current) {
        if (playingAudio.isPlaying) {
          audioRef.current.pause();
          setPlayingAudio((p) => ({ ...p, isPlaying: false }));
        } else {
          audioRef.current.play();
          setPlayingAudio((p) => ({ ...p, isPlaying: true }));
        }
      }
      return;
    }

    if (audioRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      audioRef.current.pause();
      try {
        audioRef.current.src = "";
      } catch (e) {
        console.log(e);
      }
    }

    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onloadedmetadata = () => {
      setPlayingAudio({
        index,
        isPlaying: true,
        currentTime: 0,
        duration: audio.duration || 0,
      });
    };
    audio.ontimeupdate = () => {
      setPlayingAudio((prev) =>
        prev.index === index
          ? { ...prev, currentTime: audio.currentTime }
          : prev
      );
    };
    audio.onended = () => {
      setPlayingAudio({
        index: null,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
      });
      if (audioRef.current) {
        try {
          audioRef.current.src = "";
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {}
        audioRef.current = null;
      }
    };
    audio.onerror = () => {
      console.error("Audio playback error for", url);
      setPlayingAudio({
        index: null,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
      });
    };

    audio.play().catch((err) => {
      console.error("Play prevented:", err);
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black animate-gradient" />
      <div className="absolute inset-0 z-0">
        {[...Array(80)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-60 animate-starfield"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
            }}
          />
        ))}
      </div>

      <HeaderBar
        roomId={roomId}
        username={username}
        onlineCount={onlineUsers.length}
        onOpenModal={() => setIsModalOpen(true)}
      />

      <main className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-4 sm:space-y-6 relative z-10 pt-20 sm:pt-24 pb-20 sm:pb-24">
        {messages.map((msg, idx) => (
          <MessageBubble
            key={idx}
            msg={msg}
            idx={idx}
            currentUser={username}
            playingAudio={playingAudio}
            onPlayPause={playVoiceMessage}
          />
        ))}
        <div ref={messagesEndRef} />
      </main>

      <InputBar
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        sendMessage={sendMessage}
        isRecording={isRecording}
        startRecording={startRecording}
        stopRecording={stopRecording}
        recordedBlob={recordedBlob}
        previewVoiceMessage={previewVoiceMessage}
        sendRecordedVoiceMessage={sendRecordedVoiceMessage}
      />

      <OnlineUsersModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
