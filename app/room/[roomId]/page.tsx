"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { useOnlineUsers } from "@/components/SocketProvider";
import HeaderBar from "@/components/HeaderBar";
import MessageBubble from "@/components/MessageBubble";
import InputBar from "@/components/InputBar";
import OnlineUsersModal from "@/components/OnlineUsersModal";
import { useCall, CallProvider } from "@/components/CallProvider";
import CallModal from "@/components/CallModal";
import ImageModal from "@/components/ImageModal";
import { useRoomData } from "@/hooks/useRoomData";
import { useSocketMessages } from "@/hooks/useSocketMessages";
import { useVoicePlayer } from "@/hooks/useVoicePlayer";
import { useImageUpload } from "@/hooks/useImageUpload";

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
      dots.forEach((dot) => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.strokeStyle = "rgba(99, 102, 241, 0.15)";
      ctx.lineWidth = 1;
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < CONNECTION_DISTANCE) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.stroke();
          }
        }
      }

      dots.forEach((dot) => {
        dot.x += dot.vx;
        dot.y += dot.vy;

        if (dot.x < 0 || dot.x > width) dot.vx *= -1;
        if (dot.y < 0 || dot.y > height) dot.vy *= -1;
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
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.4 }}
    />
  );
};

function RoomPageContent() {
  const searchParams = useSearchParams();
  const params = useParams();
  const roomId = params?.roomId as string;
  const username = searchParams?.get("username") || "Anonymous";

  const onlineUsers = useOnlineUsers({ roomId });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { joinCall } = useCall();

  // Custom hooks - replaces all the complex logic!
  const { data: roomData, isLoading, error } = useRoomData(roomId);
  const { messages, setMessages, sendMessage: socketSendMessage, deleteMessage } = useSocketMessages(roomId, username);
  const voicePlayer = useVoicePlayer(roomId, username);
  const imageUpload = useImageUpload(roomId, username);

  // Initialize messages from room data
  useEffect(() => {
    if (roomData) {
      setMessages(roomData.messages || []);
    }
  }, [roomData, setMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim() === "") return;
    socketSendMessage(newMessage);
    setNewMessage("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading room</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
            playingAudio={voicePlayer.playingAudio}
            onPlayPause={voicePlayer.playVoiceMessage}
            onJoinCall={joinCall}
            onDelete={deleteMessage}
            onImageClick={setSelectedImage}
          />
        ))}
        <div ref={messagesEndRef} />
      </main>

      <InputBar
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        sendMessage={sendMessage}
        isRecording={voicePlayer.isRecording}
        startRecording={voicePlayer.startRecording}
        stopRecording={voicePlayer.stopRecording}
        recordedBlob={voicePlayer.recordedBlob}
        previewVoiceMessage={voicePlayer.previewVoiceMessage}
        sendRecordedVoiceMessage={voicePlayer.sendRecordedVoiceMessage}
        onDiscardRecording={voicePlayer.discardRecording}
        isSendingVoice={voicePlayer.isSendingVoice}
        onImageSelect={imageUpload.handleImageSelect}
        selectedImageFile={imageUpload.selectedImageFile}
        isSendingImage={imageUpload.isSendingImage}
        onDiscardImage={imageUpload.discardImage}
        sendSelectedImage={imageUpload.sendSelectedImage}
      />

      <OnlineUsersModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <CallModal />
      <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
    </div>
  );
}

export default function RoomPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const roomId = params?.roomId as string;
  const username = searchParams?.get("username") || "Anonymous";

  return (
    <CallProvider roomId={roomId} username={username}>
      <RoomPageContent />
    </CallProvider>
  );
}
