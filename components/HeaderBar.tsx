"use client";
import React from "react";
import Image from "next/image";
import { UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeaderBar({
  roomId,
  username,
  onlineCount,
  onOpenModal,
}: {
  roomId?: string | null | undefined;
  username: string;
  onlineCount: number;
  onOpenModal: () => void;
}) {
  return (
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
          onClick={onOpenModal}
          className="bg-gray-800/50 border border-neon-blue/30 text-neon-blue hover:bg-neon-blue/10 rounded-full p-2 sm:p-3 transition-all duration-300 hover:scale-110 flex items-center space-x-1"
        >
          <UsersIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          <span className="text-white text-sm font-medium">{onlineCount}</span>
        </Button>
      </div>
    </header>
  );
}
