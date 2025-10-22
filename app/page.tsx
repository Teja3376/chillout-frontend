"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import Image from "next/image";

// ✅ Anime.js v4 import (works with Next.js)
// import * as anime from "animejs";

export default function HomePage() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleJoin = async () => {
    if (!roomId.trim()) return;
    setIsLoading(true);
    // Simulate loading for better UX
    setTimeout(() => {
      router.push(`/room/${roomId}?username=${username || "anonymous"}`);
      setIsLoading(false);
    }, 1500);
  };

  // Removed problematic animations to fix bugs

  return (
    <div className="w-full h-full flex items-center justify-center min-h-screen bg-black p-4 sm:p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black animate-gradient"></div>

      {/* Star Wars Background - Floating Stars */}
      <div className="absolute inset-0 z-0">
        {[...Array(80)].map((_, i) => (
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
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 bg-gradient-to-b from-transparent via-neon-red to-transparent opacity-30 animate-laser"
            style={{
              left: `${25 + i * 25}%`,
              top: "0",
              height: "100%",
              animationDelay: `${i * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Holographic Grid */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-20 animate-hologram"></div>
        <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-purple to-transparent opacity-20 animate-hologram"></div>
        <div className="absolute left-1/3 top-0 w-px h-full bg-gradient-to-b from-transparent via-neon-pink to-transparent opacity-20 animate-hologram"></div>
        <div className="absolute left-2/3 top-0 w-px h-full bg-gradient-to-b from-transparent via-neon-green to-transparent opacity-20 animate-hologram"></div>
      </div>

      <Card className="card-container w-full max-w-md mx-4 sm:mx-auto bg-gray-900/80 backdrop-blur-2xl border border-neon-green/30 shadow-2xl rounded-3xl transition-all duration-500 hover:shadow-neon-green/20 hover:border-neon-green/50 relative z-10 animate-glow">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl sm:text-6xl font-extrabold mb-4">
            <Image
              src="/logo.png"
              alt="Chillout Logo"
              width={80}
              height={80}
              className="mx-auto mb-4 sm:w-24 sm:h-24"
            />
          </CardTitle>
          <p className="text-sm text-gray-300 mt-2 animate-pulse neon-green">
            Join an existing room or create a new one to get started.
          </p>
        </CardHeader>

        <CardContent className="space-y-5">
          <Input
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-field bg-gray-800/50 border-neon-blue/30 text-white placeholder:text-gray-400 focus-visible:ring-neon-blue rounded-xl shadow-lg backdrop-blur-sm hover:border-neon-blue/50 transition-all duration-300"
          />

          <Input
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="input-field bg-gray-800/50 border-neon-purple/30 text-white placeholder:text-gray-400 focus-visible:ring-neon-purple rounded-xl shadow-lg backdrop-blur-sm hover:border-neon-purple/50 transition-all duration-300"
          />
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            className="join-button w-full bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink hover:from-neon-blue/80 hover:via-neon-purple/80 hover:to-neon-pink/80 text-white font-semibold rounded-xl py-3 text-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 animate-glow"
            onClick={handleJoin}
            disabled={isLoading}
          >
            {isLoading ? "Connecting to the Force..." : "Create / Join Room"}
          </Button>

          <p className="text-xs text-gray-400 text-center">
            Enter a Room ID to join an existing room, or type a new one to
            create it.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
