"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MicIcon, MicOffIcon, PlayIcon, PauseIcon, Trash2Icon, SendIcon, ImageIcon } from "lucide-react";

export default function InputBar({
  newMessage,
  setNewMessage,
  sendMessage,
  isRecording,
  startRecording,
  stopRecording,
  recordedBlob,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  previewVoiceMessage,
  sendRecordedVoiceMessage,
  onDiscardRecording,
  isSendingVoice,
  onImageSelect,
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
  onDiscardRecording: () => void;
  isSendingVoice: boolean;
  onImageSelect: (file: File) => void;
}) {
  const [isPlayingPreview, setIsPlayingPreview] = React.useState(false);
  const [previewProgress, setPreviewProgress] = React.useState(0);
  const [previewDuration, setPreviewDuration] = React.useState(0);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const imageInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onloadedmetadata = () => {
        setPreviewDuration(audio.duration);
      };

      audio.ontimeupdate = () => {
        setPreviewProgress((audio.currentTime / audio.duration) * 100);
      };

      audio.onended = () => {
        setIsPlayingPreview(false);
        setPreviewProgress(0);
      };

      return () => {
        URL.revokeObjectURL(url);
        audio.pause();
        audioRef.current = null;
      };
    }
  }, [recordedBlob]);

  const togglePreviewPlay = () => {
    if (audioRef.current) {
      if (isPlayingPreview) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlayingPreview(!isPlayingPreview);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onImageSelect(file);
    }
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-background/60 backdrop-blur-2xl border-t border-primary/20 flex gap-3 z-20 shadow-[0_-5px_30px_-10px_rgba(var(--primary),0.2)]">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />
      {recordedBlob ? (
        <div className="flex-1 flex items-center gap-3 bg-card/50 border border-primary/30 rounded-2xl p-2 px-4 animate-in fade-in slide-in-from-bottom-4">
          <Button
            onClick={onDiscardRecording}
            variant="ghost"
            className="h-10 w-10 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2Icon className="w-5 h-5" />
          </Button>

          <div className="flex-1 flex items-center gap-3">
            <Button
              onClick={togglePreviewPlay}
              variant="ghost"
              className="h-10 w-10 rounded-full text-primary hover:text-primary hover:bg-primary/10"
            >
              {isPlayingPreview ? (
                <PauseIcon className="w-5 h-5" />
              ) : (
                <PlayIcon className="w-5 h-5" />
              )}
            </Button>

            <div className="flex-1 flex flex-col justify-center gap-1">
              <div className="h-1.5 bg-primary/20 rounded-full overflow-hidden w-full">
                <div
                  className="h-full bg-primary transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                  style={{ width: `${previewProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>
                  {formatTime(
                    (previewDuration * previewProgress) / 100 || 0
                  )}
                </span>
                <span>{formatTime(previewDuration || 0)}</span>
              </div>
            </div>
          </div>

          <Button
            onClick={sendRecordedVoiceMessage}
            disabled={isSendingVoice}
            className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-[0_0_15px_rgba(var(--primary),0.4)] transition-all hover:scale-105 px-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <SendIcon className="w-5 h-5" />
          </Button>
        </div>
      ) : (
        <>
          <div className="relative flex-1 group">
             <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-secondary/50 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <Input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="relative flex-1 rounded-2xl bg-background/40 border-white/10 text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary/50 focus-visible:border-primary/50 backdrop-blur-md transition-all duration-300 text-base py-3 h-12 sm:h-14 shadow-inner"
            />
          </div>

          {newMessage.trim() ? (
            // Show send button when there's text
            <Button
              onClick={sendMessage}
              className="rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all duration-300 hover:scale-105 w-12 sm:w-14 h-12 sm:h-14 flex items-center justify-center"
            >
              <SendIcon className="w-5 h-5" />
            </Button>
          ) : (
            // Show image and voice buttons when input is empty
            <>
              <Button
                onClick={handleImageClick}
                className="rounded-2xl font-bold shadow-lg transition-all duration-300 hover:scale-105 w-12 sm:w-14 h-12 sm:h-14 flex items-center justify-center bg-secondary/80 hover:bg-secondary text-secondary-foreground border border-white/10"
              >
                <ImageIcon className="w-5 h-5" />
              </Button>

              <Button
                onClick={isRecording ? stopRecording : startRecording}
                className={`rounded-2xl font-bold shadow-lg transition-all duration-300 hover:scale-105 w-12 sm:w-14 h-12 sm:h-14 flex items-center justify-center ${
                  isRecording
                    ? "bg-destructive/20 text-destructive border border-destructive/50 animate-pulse shadow-[0_0_20px_rgba(var(--destructive),0.4)]"
                    : "bg-secondary/80 hover:bg-secondary text-secondary-foreground border border-white/10"
                }`}
              >
                {isRecording ? (
                  <div className="relative">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75 animate-ping"></span>
                    <MicOffIcon className="w-5 h-5 relative z-10" />
                  </div>
                ) : (
                  <MicIcon className="w-5 h-5" />
                )}
              </Button>
            </>
          )}
        </>
      )}
    </footer>
  );
}
