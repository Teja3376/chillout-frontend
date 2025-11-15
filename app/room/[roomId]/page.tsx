"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { useSocket, useOnlineUsers, SOCKET_URL } from "@/components/SocketProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetRoom } from "@/lib/hooks";
import { roomApi } from "@/lib/apiClient";
// import SplitText from "@/components/SplitText";
import OnlineUsersModal from "@/components/OnlineUsersModal";
import Image from "next/image";
import {
  UsersIcon,
  MicIcon,
  MicOffIcon,
  PlayIcon,
  PauseIcon,
} from "lucide-react";
// import * as anime from "animejs";

export default function RoomPage() {
  const { roomId } = useParams();
  const searchParams = useSearchParams();
  const username = searchParams.get("username") || "anonymous";
  const socket = useSocket();
  const onlineUsers = useOnlineUsers();

  const { data: roomData } = useGetRoom(roomId as string);

  const [messages, setMessages] = useState<
    { username: string; message: string; type?: string; url?: string }[]
  >([]);
  const [newMessage, setNewMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
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
        roomData.messages.map((msg) => ({
          ...msg,
          url: msg.url
            ? msg.url.startsWith("http")
              ? msg.url
              : `${SOCKET_URL}${msg.url}`
            : undefined,
        }))
      );
    }
  }, [roomData]);

  useEffect(() => {
    socket.emit("join_room", { roomId, username });

    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
      // Simple CSS animation for new message
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
    });

    socket.on("receive_voice_message", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          ...data,
          url: data.url.startsWith("http")
            ? data.url
            : `${SOCKET_URL}${data.url}`,
        },
      ]);
      // Simple CSS animation for new message
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
    });

    return () => {
      socket.off("receive_message");
      socket.off("receive_voice_message");
    };
  }, [socket, roomId, username]);

  useEffect(() => {
    // auto scroll to bottom when new message arrives
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
      recorder.ondataavailable = (e) => chunks.push(e.data);
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
    if (playingAudio.index === index && playingAudio.isPlaying) {
      // Pause
      if (audioRef.current) {
        audioRef.current.pause();
        setPlayingAudio((prev) => ({ ...prev, isPlaying: false }));
      }
    } else {
      // Play new or resume
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onloadedmetadata = () => {
        setPlayingAudio({
          index,
          isPlaying: true,
          currentTime: 0,
          duration: audio.duration,
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
      };
      audio.play();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black animate-gradient"></div>

      {/* Star Wars Background - Floating Stars */}
      <div className="absolute inset-0 z-0">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-60 animate-starfield"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
            }}
          />
        ))}
      </div>

      {/* Laser Beam Effects */}
      <div className="absolute inset-0 z-0">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 bg-gradient-to-b from-transparent via-neon-red to-transparent opacity-30 animate-laser"
            style={{
              left: `${20 + i * 15}%`,
              top: "0",
              height: "100%",
              animationDelay: `${i * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Holographic Grid */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-20 animate-hologram"></div>
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-purple to-transparent opacity-20 animate-hologram"></div>
        <div className="absolute left-1/4 top-0 w-px h-full bg-gradient-to-b from-transparent via-neon-pink to-transparent opacity-20 animate-hologram"></div>
        <div className="absolute left-3/4 top-0 w-px h-full bg-gradient-to-b from-transparent via-neon-green to-transparent opacity-20 animate-hologram"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 p-2 sm:p-4 bg-gray-900/80 backdrop-blur-2xl shadow-2xl border-b border-neon-green/30 z-20 flex justify-between items-center">
        <div className="flex items-center">
          <Image
            src="/logo.png"
            alt="Chillout Logo"
            width={40}
            height={40}
            className="inline-block mr-2 sm:mr-4 sm:w-12 sm:h-12"
          />
          <h2 className="text-lg sm:text-2xl text-white font-semibold truncate">
            Room: {roomId}
          </h2>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium text-sm sm:text-base truncate max-w-20 sm:max-w-none">
              {username}
            </span>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-gray-800/50 border border-neon-blue/30 text-neon-blue hover:bg-neon-blue/10 rounded-full p-2 sm:p-3 transition-all duration-300 hover:scale-110 flex items-center space-x-1"
          >
            <UsersIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            <span className="text-white text-sm font-medium">
              {onlineUsers.length}
            </span>
          </Button>
        </div>
      </header>

      {/* Messages Section */}
      <main className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-4 sm:space-y-6 relative z-10 pt-20 sm:pt-24 pb-20 sm:pb-24">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message-bubble flex ${
              msg.username === username ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs sm:max-w-sm px-4 sm:px-6 py-3 sm:py-4 rounded-3xl shadow-2xl backdrop-blur-sm border-2 ${
                msg.username === username
                  ? "bg-gradient-to-r from-red-900 to-red-700 text-white rounded-br-md light-saber-red "
                  : "bg-gradient-to-r from-green-900 to-green-700 text-white rounded-bl-md light-saber-green "
              } transition-all duration-500 hover:shadow-neon-green/20`}
            >
              <p className="text-sm font-bold opacity-90 mb-2 flex items-center">
                {/* <span
                  className={`w-3 h-3 rounded-full mr-2 ${
                    msg.username === username ? "bg-neon-blue" : "bg-neon-green"
                  } animate-pulse`}
                ></span> */}
                {msg.username === username ? "You" : msg.username}
              </p>
              {msg.type === "voice" && msg.url ? (
                <div className="flex flex-col items-start space-y-2">
                  <Button
                    onClick={() => playVoiceMessage(idx, msg.url!)}
                    className="bg-gray-700 hover:bg-gray-600 text-white rounded-full p-2"
                  >
                    {playingAudio.index === idx && playingAudio.isPlaying ? (
                      <PauseIcon className="w-5 h-5" />
                    ) : (
                      <PlayIcon className="w-5 h-5" />
                    )}
                  </Button>
                  {playingAudio.index === idx && (
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-neon-blue h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            (playingAudio.currentTime / playingAudio.duration) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="break-words text-lg">{msg.message}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Section */}
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
            disabled={isPreviewing}
            className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-2xl transition-all duration-300 hover:scale-110 px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg"
          >
            {isPreviewing ? "Playing..." : "Preview"}
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

      <OnlineUsersModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
