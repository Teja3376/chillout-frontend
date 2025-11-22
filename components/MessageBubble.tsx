"use client";
import React from "react";
import VoiceMessagePlayer from "@/components/VoiceMessagePlayer";

export default function MessageBubble({
  msg,
  idx,
  currentUser,
  playingAudio,
  onPlayPause,
}: {
  msg: { username: string; message: string; type?: string; url?: string };
  idx: number;
  currentUser: string;
  playingAudio: {
    index: number | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
  };
  onPlayPause: (index: number, url: string) => void;
}) {
  const isMe = msg.username === currentUser;
  return (
    <div
      className={`message-bubble flex ${
        isMe ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-xs sm:max-w-sm px-4 sm:px-6 py-3 sm:py-4 rounded-3xl shadow-lg backdrop-blur-md border ${
          isMe
            ? "bg-primary/90 text-primary-foreground rounded-br-sm border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.3)]"
            : "bg-card/90 text-card-foreground rounded-bl-sm border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.2)]"
        } transition-all duration-300 hover:scale-[1.02]`}
        style={{ width: "auto" }}
      >
        <p className={`text-xs font-bold opacity-80 mb-1 flex items-center ${isMe ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
          {isMe ? "You" : msg.username}
        </p>

        {msg.type === "voice" && msg.url ? (
          <div className="flex items-center">
            <div
              className="px-3 py-2 rounded-lg "
              style={{ minWidth: 220, maxWidth: 420 }}
            >
              <VoiceMessagePlayer
                src={msg.url}
                index={idx}
                playingAudio={playingAudio}
                onPlayPause={onPlayPause}
              />
            </div>
          </div>
        ) : (
          <p className="break-words text-base sm:text-lg leading-relaxed">{msg.message}</p>
        )}
      </div>
    </div>
  );
}
