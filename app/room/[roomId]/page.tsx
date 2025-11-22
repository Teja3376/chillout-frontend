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
      
      // Update and draw dots
      ctx.fillStyle = "rgba(0, 255, 255, 0.6)"; // Neon Cyan
      ctx.strokeStyle = "rgba(0, 255, 255, 0.1)";

      dots.forEach((dot, i) => {
        dot.x += dot.vx;
        dot.y += dot.vy;

        // Bounce off edges
        if (dot.x < 0 || dot.x > width) dot.vx *= -1;
        if (dot.y < 0 || dot.y > height) dot.vy *= -1;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        ctx.fill();

        // Connect dots
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
  const socket = useSocket();
  const onlineUsers = useOnlineUsers({ roomId: roomId as string });
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
      />

      <OnlineUsersModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
