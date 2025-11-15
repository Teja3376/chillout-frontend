"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MicIcon, MicOffIcon } from "lucide-react";

export default function InputBar({
  newMessage,
  setNewMessage,
  sendMessage,
  isRecording,
  startRecording,
  stopRecording,
  recordedBlob,
  previewVoiceMessage,
  sendRecordedVoiceMessage,
}: {
  newMessage: string;
  setNewMessage: (v: string) => void;
  sendMessage: () => void;
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  recordedBlob: Blob | null;
  previewVoiceMessage: () => void;
  sendRecordedVoiceMessage: () => void;
}) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 p-2 sm:p-4 bg-gray-900/80 backdrop-blur-2xl border-t border-neon-green/30 flex gap-2 sm:gap-3 z-20">
      <Input
        type="text"
        placeholder="Type a message..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        className="flex-1 rounded-2xl bg-gray-800/50 border-neon-blue/30 text-white placeholder:text-gray-400 focus-visible:ring-neon-blue backdrop-blur-sm hover:border-neon-blue/50 transition-all duration-300 text-base sm:text-lg py-2 sm:py-3"
      />

      {recordedBlob && (
        <Button
          onClick={previewVoiceMessage}
          className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-2xl transition-all duration-300 hover:scale-110 px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg"
        >
          Preview
        </Button>
      )}

      <Button
        onClick={isRecording ? stopRecording : startRecording}
        className={`rounded-2xl font-bold shadow-2xl transition-all duration-300 hover:scale-110 px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg ${
          isRecording
            ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
            : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
        }`}
      >
        {isRecording ? (
          <MicOffIcon className="w-5 h-5" />
        ) : (
          <MicIcon className="w-5 h-5" />
        )}
      </Button>

      {recordedBlob ? (
        <Button
          onClick={sendRecordedVoiceMessage}
          className="rounded-2xl bg-gradient-to-r from-neon-blue to-neon-purple hover:from-neon-blue/80 hover:to-neon-purple/80 text-white font-bold shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-neon-blue/50 animate-glow px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg"
        >
          Send Voice
        </Button>
      ) : (
        <Button
          onClick={sendMessage}
          className="rounded-2xl bg-gradient-to-r from-neon-blue to-neon-purple hover:from-neon-blue/80 hover:to-neon-purple/80 text-white font-bold shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-neon-blue/50 animate-glow px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg"
        >
          Send
        </Button>
      )}
    </footer>
  );
}
