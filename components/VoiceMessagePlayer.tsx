"use client";
import React from "react";
import { PlayIcon, PauseIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

function formatTime(sec: number) {
  if (!isFinite(sec) || !sec) return "0:00";
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  const m = Math.floor(sec / 60).toString();
  return `${m}:${s}`;
}

export default function VoiceMessagePlayer({
  src,
  index,
  playingAudio,
  onPlayPause,
  isMe,
}: {
  src: string;
  index: number;
  playingAudio: {
    index: number | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
  };
  onPlayPause: (index: number, url: string) => void;
  isMe?: boolean;
}) {
  const current = playingAudio.index === index ? playingAudio : null;
  const progress =
    current && current.duration > 0
      ? Math.min((current.currentTime / current.duration) * 100, 100)
      : 0;

  // Define colors based on isMe (sender vs receiver)
  // If isMe (sender): Background is Primary (usually dark/colored). Content should be light/white.
  // If !isMe (receiver): Background is Card (usually light/dark gray). Content should be Primary or Foreground.
  
  const buttonClass = isMe
    ? "bg-white/20 hover:bg-white/30 border-white/40 text-white"
    : "bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary";

  const progressTrackClass = isMe ? "bg-white/20" : "bg-primary/20";
  const progressBarClass = isMe ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]" : "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.6)]";
  const textClass = isMe ? "text-white/80" : "text-muted-foreground";
  const visualizerClass = isMe ? "bg-white" : "bg-primary";

  return (
    <div className="flex items-center space-x-3">
      <Button
        variant="outline"
        onClick={() => onPlayPause(index, src)}
        className={`w-11 h-11 rounded-full flex items-center justify-center border hover:scale-105 transition-transform ${buttonClass}`}
        aria-label="Play voice message"
      >
        {current?.isPlaying ? (
          <PauseIcon className="w-5 h-5" />
        ) : (
          <PlayIcon className="w-5 h-5 ml-0.5" />
        )}
      </Button>

      <div className="flex-1 min-w-0">
        <div className={`w-full h-1.5 rounded-full overflow-hidden ${progressTrackClass}`}>
          <div
            className={`h-full rounded-full transition-all ${progressBarClass}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className={`flex justify-between text-[11px] mt-1.5 font-mono ${textClass}`}>
          <span>{formatTime(current?.currentTime ?? 0)}</span>
          {
           (current?.duration ?? 0) > 0 ? (
             <span>{formatTime(current?.duration ?? 0)}</span>
           ) : (
             <span>-:--</span>
           )
          }
        </div>
      </div>

      <div className="w-8 flex items-center justify-center">
        <div
          className={`w-4 h-4 flex items-end space-x-0.5 ${
            current?.isPlaying ? "opacity-100" : "opacity-50"
          }`}
          aria-hidden
        >
          <span
            className={`block w-1 rounded-sm animate-eq-1 ${visualizerClass}`}
            style={{
              height: current?.isPlaying ? `${10 + progress / 10}px` : "6px",
            }}
          />
          <span
            className={`block w-1 rounded-sm animate-eq-2 ${visualizerClass}`}
            style={{
              height: current?.isPlaying ? `${6 + progress / 15}px` : "4px",
            }}
          />
          <span
            className={`block w-1 rounded-sm animate-eq-3 ${visualizerClass}`}
            style={{
              height: current?.isPlaying ? `${8 + progress / 12}px` : "5px",
            }}
          />
        </div>
      </div>
    </div>
  );
}
