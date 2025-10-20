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

export default function HomePage() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const router = useRouter();

  const handleJoin = () => {
    if (!roomId.trim()) return; // prevent empty room
    router.push(`/room/${roomId}?username=${username || "anonymous"}`);
  };

  return (
    <div className="w-full h-full flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-200 via-indigo-100 to-cyan-200 p-6">
      <Card className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl transition-transform transform">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-extrabold bg-gradient-to-r from-indigo-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent drop-shadow-sm">
            Chillout App
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Join an existing room or create a new one to get started.
          </p>
        </CardHeader>

        <CardContent className="space-y-5">
          <Input
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-white/60 border-gray-300 focus-visible:ring-pink-400 rounded-xl shadow-sm"
          />

          <Input
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="bg-white/60 border-gray-300 focus-visible:ring-indigo-400 rounded-xl shadow-sm"
          />
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            className="w-full bg-gradient-to-r from-indigo-500 via-pink-500 to-cyan-500 hover:from-indigo-600 hover:via-pink-600 hover:to-cyan-600 text-white font-semibold rounded-xl py-3 text-lg shadow-md transition-all"
            onClick={handleJoin}
          >
             Create / Join Room
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Enter a Room ID to join an existing room, or type a new one to create it.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
