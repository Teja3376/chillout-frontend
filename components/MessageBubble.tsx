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
        className={`max-w-xs sm:max-w-sm px-4 sm:px-6 py-3 sm:py-4 rounded-3xl shadow-2xl backdrop-blur-sm border-2 ${
          isMe
            ? "bg-gradient-to-r from-red-900 to-red-700 text-white rounded-br-md light-saber-red"
            : "bg-gradient-to-r from-green-900 to-green-700 text-white rounded-bl-md light-saber-green"
        } transition-all duration-500 hover:shadow-neon-green/20`}
        style={{ width: "auto" }}
      >
        <p className="text-sm font-bold opacity-90 mb-2 flex items-center">
          {isMe ? "You" : msg.username}
        </p>

        {msg.type === "voice" && msg.url ? (
          <div className="flex items-center">
            <div
              className="px-3 py-2 rounded-lg "
              style={{ minWidth: 220, maxWidth: 420 }}
            >
              {/* <p className="text-xs text-gray-300 font-semibold mb-2">
                {isMe ? "You" : msg.username}
              </p> */}
              <VoiceMessagePlayer
                src={msg.url}
                index={idx}
                playingAudio={playingAudio}
                onPlayPause={onPlayPause}
              />
            </div>
          </div>
        ) : (
          <p className="break-words text-lg">{msg.message}</p>
        )}
      </div>
    </div>
  );
}
