import { useState, useRef } from "react";
import { useSocket } from "@/components/SocketProvider";
import { roomApi } from "@/lib/apiClient";
import { SOCKET_URL } from "@/components/SocketProvider";

export function useVoicePlayer(roomId: string, username: string) {
  const socket = useSocket();
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isSendingVoice, setIsSendingVoice] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<{
    index: number | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    isLoading: boolean;
  }>({ index: null, isPlaying: false, currentTime: 0, duration: 0, isLoading: false });

  const audioRef = useRef<HTMLAudioElement | null>(null);

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
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
      audio.play();
    }
  };

  const sendRecordedVoiceMessage = async () => {
    if (recordedBlob && !isSendingVoice && socket) {
      setIsSendingVoice(true);
      try {
        const response = await roomApi.uploadVoice(roomId, username, recordedBlob);
        socket.emit("send_voice_message", {
          roomId,
          username,
          url: `${SOCKET_URL}${response.url}`,
        });
        setRecordedBlob(null);
      } catch (error) {
        console.error("Error sending recorded voice message:", error);
      } finally {
        setIsSendingVoice(false);
      }
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
      } catch {
        console.log("Error clearing audio source");
      }
    }

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
        } catch {
          // Ignore error
        }
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

  return {
    isRecording,
    recordedBlob,
    isSendingVoice,
    playingAudio,
    startRecording,
    stopRecording,
    previewVoiceMessage,
    sendRecordedVoiceMessage,
    playVoiceMessage,
    discardRecording: () => setRecordedBlob(null),
  };
}
