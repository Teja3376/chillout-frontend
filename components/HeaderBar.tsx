"use client";
import React from "react";
import Image from "next/image";
import { UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

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
    <header className="fixed top-0 left-0 right-0 p-2 sm:p-4 bg-background/80 backdrop-blur-xl border-b border-border/50 z-20 flex justify-between items-center shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
          <span className="text-xl">🌌</span>
        </div>
        <div className="flex flex-col">
          <h2 className="text-sm font-bold text-foreground tracking-tight">
            Room: <span className="text-primary font-mono">{roomId}</span>
          </h2>
          <span className="text-xs text-muted-foreground font-medium">
            {username}
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-3">
        <Button
          onClick={onOpenModal}
          variant="outline"
          className="bg-background/50 border-border/50 text-foreground hover:bg-accent/50 rounded-full px-4 h-10 transition-all duration-300 hover:scale-105 flex items-center space-x-2"
        >
          <UsersIcon className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold">{onlineCount}</span>
        </Button>
        <div className="h-6 w-px bg-border/50 mx-1"></div>
        <ThemeToggle />
      </div>
    </header>
  );
}
