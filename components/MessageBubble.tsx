"use client";
import React from "react";
import VoiceMessagePlayer from "@/components/VoiceMessagePlayer";
import { Phone, Trash2 } from "lucide-react";

export default function MessageBubble({
  msg,
  idx,
  currentUser,
  playingAudio,
  onPlayPause,
  onJoinCall,
  onDelete,
  onImageClick,
}: {
  msg: { _id?: string; username: string; message: string; type?: string; url?: string; callInitiator?: string };
  idx: number;
  currentUser: string;
  playingAudio: {
    index: number | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    isLoading: boolean;
  };
  onPlayPause: (index: number, url: string) => void;
  onJoinCall?: () => void;
  onDelete?: (messageId: string) => void;
  onImageClick?: (url: string) => void;
}) {
  const isMe = msg.username === currentUser;
  
  // Handle call notification messages - simple centered text
  if (msg.type === "call_notification") {
    return (
      <div className="message-bubble flex justify-center my-2">
        <div className="px-4 py-2 rounded-full bg-muted/50 border border-border/50 backdrop-blur-sm">
          <span className="text-xs text-muted-foreground">{msg.message}</span>
        </div>
      </div>
    );
  }

  // Handle call ended messages
  if (msg.type === "call_ended") {
    return (
      <div className="message-bubble flex justify-center my-2">
        <div className="px-4 py-2 rounded-full bg-muted/50 border border-border/50 backdrop-blur-sm">
          <span className="text-xs text-muted-foreground">{msg.message}</span>
        </div>
      </div>
    );
  }

  // Regular message bubbles
  return (
    <div
      className={`message-bubble flex group ${
        isMe ? "justify-end" : "justify-start"
      }`}
    >
      <div className={`flex items-center gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
        <div
          className={`max-w-xs sm:max-w-sm px-4 sm:px-6 py-3 sm:py-4 rounded-3xl shadow-lg backdrop-blur-md border ${
            isMe
              ? "bg-primary/90 text-primary-foreground rounded-br-sm border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.3)]"
              : "bg-card/90 text-card-foreground rounded-bl-sm border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.2)]"
          } transition-all duration-300 hover:scale-[1.02] relative`}
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
                  isMe={isMe}
                />
              </div>
            </div>
          ) : msg.type === "image" && msg.url ? (
            <div className="flex items-center">
              <img
                src={msg.url}
                alt="Shared image"
                className="h-[100px] w-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity object-cover"
                onClick={() => onImageClick?.(msg.url!)}
              />
            </div>
          ) : (
            <p className="break-words text-base sm:text-lg leading-relaxed">{msg.message}</p>
          )}
        </div>

        {/* Delete Button */}
        {isMe && onDelete && msg._id && (
          <button
            onClick={() => onDelete(msg._id!)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full hover:bg-red-500/10 text-red-500 focus:opacity-100"
            title="Delete message"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
