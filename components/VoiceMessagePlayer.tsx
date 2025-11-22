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
}) {
  const current = playingAudio.index === index ? playingAudio : null;
  const progress =
    current && current.duration > 0
      ? Math.min((current.currentTime / current.duration) * 100, 100)
      : 0;

  return (
    <div className="flex items-center space-x-3">
      <Button
        variant="outline"
        onClick={() => onPlayPause(index, src)}
        className="w-11 h-11 rounded-full flex items-center justify-center bg-primary/20 hover:bg-primary/30 border border-primary/50 hover:scale-105 transition-transform"
        aria-label="Play voice message"
      >
        {current?.isPlaying ? (
          <PauseIcon className="w-5 h-5 text-primary" />
        ) : (
          <PlayIcon className="w-5 h-5 text-primary" />
        )}
      </Button>

      <div className="flex-1 min-w-0">
        <div className="w-full bg-primary/20 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all shadow-[0_0_8px_rgba(var(--primary),0.6)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between text-[11px] mt-1.5 text-muted-foreground font-mono">
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
            className="block w-1 rounded-sm bg-primary animate-eq-1"
            style={{
              height: current?.isPlaying ? `${10 + progress / 10}px` : "6px",
            }}
          />
          <span
            className="block w-1 rounded-sm bg-primary animate-eq-2"
            style={{
              height: current?.isPlaying ? `${6 + progress / 15}px` : "4px",
            }}
          />
          <span
            className="block w-1 rounded-sm bg-primary animate-eq-3"
            style={{
              height: current?.isPlaying ? `${8 + progress / 12}px` : "5px",
            }}
          />
        </div>
      </div>
    </div>
  );
}
