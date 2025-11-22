"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { useSocket, useOnlineUsers, SOCKET_URL } from "@/components/SocketProvider";
import HeaderBar from "@/components/HeaderBar";
import MessageBubble from "@/components/MessageBubble";
import InputBar from "@/components/InputBar";
import OnlineUsersModal from "@/components/OnlineUsersModal";
import { useGetRoom } from "@/lib/hooks";
import { roomApi } from "@/lib/apiClient";
import { CallProvider, useCall } from "@/components/CallProvider";
import CallModal from "@/components/CallModal";

const FlowingDots = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    const dots: { x: number; y: number; vx: number; vy: number; size: number }[] = [];
    const DOT_COUNT = 100;
    const CONNECTION_DISTANCE = 150;

    for (let i = 0; i < DOT_COUNT; i++) {
      dots.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = "rgba(99, 102, 241, 0.8)";
      ctx.strokeStyle = "rgba(99, 102, 241, 0.15)";

      dots.forEach((dot, i) => {
        dot.x += dot.vx;
        dot.y += dot.vy;

        if (dot.x < 0 || dot.x > width) dot.vx *= -1;
        if (dot.y < 0 || dot.y > height) dot.vy *= -1;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < dots.length; j++) {
          const other = dots[j];
          const dx = dot.x - other.x;
          const dy = dot.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < CONNECTION_DISTANCE) {
            ctx.beginPath();
            ctx.moveTo(dot.x, dot.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none opacity-60"
    />
  );
};

export default function RoomPage() {
  const { roomId } = useParams() as { roomId: string };
  const searchParams = useSearchParams();
  const username = searchParams.get("username") || "anonymous";

  return (
    <CallProvider roomId={roomId} username={username}>
      <RoomContent roomId={roomId} username={username} />
    </CallProvider>
  );
}

function RoomContent({ roomId, username }: { roomId: string; username: string }) {
  const socket = useSocket();
  const onlineUsers = useOnlineUsers({ roomId });
  const { data: roomData } = useGetRoom(roomId);
  const { joinCall } = useCall();

  const [messages, setMessages] = useState<
    { username: string; message: string; type?: string; url?: string; callInitiator?: string }[]
  >([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isSendingVoice, setIsSendingVoice] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<{
    index: number | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    isLoading: boolean;
  }>({ index: null, isPlaying: false, currentTime: 0, duration: 0, isLoading: false });

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

    socket.on("call_notification", (data: {
      username: string;
      message: string;
      type: string;
      callInitiator: string;
    }) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("call_ended_notification", (data: {
      username: string;
      message: string;
      type: string;
    }) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receive_message");
      socket.off("receive_voice_message");
      socket.off("call_notification");
      socket.off("call_ended_notification");
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
    if (recordedBlob && !isSendingVoice) {
      setIsSendingVoice(true);
      try {
        await sendVoiceMessage(recordedBlob);
        setRecordedBlob(null);
      } catch (error) {
        console.error("Error sending recorded voice message:", error);
      } finally {
        setIsSendingVoice(false);
      }
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
      audioRef.current.pause();
      try {
        audioRef.current.src = "";
      } catch (e) {
        console.log(e);
      }
    }

    // Set loading state immediately
    setPlayingAudio({
      index,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      isLoading: true,
    });

    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onloadedmetadata = () => {
      setPlayingAudio({
        index,
        isPlaying: true,
        currentTime: 0,
        duration: audio.duration || 0,
        isLoading: false,
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
        isLoading: false,
      });
      if (audioRef.current) {
        try {
          audioRef.current.src = "";
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
        isLoading: false,
      });
    };

    audio.play().catch((err) => {
      console.error("Play prevented:", err);
      setPlayingAudio({
        index: null,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        isLoading: false,
      });
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden selection:bg-primary/20">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-background to-background z-0" />
      <FlowingDots />

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
            onJoinCall={joinCall}
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
        onDiscardRecording={() => setRecordedBlob(null)}
        isSendingVoice={isSendingVoice}
      />

      <OnlineUsersModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <CallModal />
    </div>
  );
}
