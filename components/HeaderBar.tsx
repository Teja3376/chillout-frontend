"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { UsersIcon, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "next-themes";

import { useCall } from "./CallProvider";
import { Phone, PhoneOff } from "lucide-react";

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
  const { joinCall, isInCall, leaveCall } = useCall();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoSrc = !mounted ? "/Chillout-dark.png" : theme === "light" ? "/Chillout-light.png" : "/Chillout-dark.png";

  return (
    <header className="fixed top-0 left-0 right-0 p-2 sm:p-4 bg-background/80 backdrop-blur-xl border-b border-border/50 z-20 flex justify-between items-center shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xs bg-primary/10 flex items-center justify-center border border-primary/20">
          <Image src={logoSrc} alt="Chillout" width={32} height={32} className="rounded-xs" />
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
        {isInCall ? (
          <Button
            onClick={leaveCall}
            variant="destructive"
            className="rounded-full px-4 h-10 transition-all duration-300 hover:scale-105 flex items-center space-x-2 bg-red-600 hover:bg-red-700"
          >
            <PhoneOff className="w-4 h-4" />
            <span className="text-sm font-bold hidden sm:inline">Leave</span>
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                className="bg-primary hover:bg-primary/90 rounded-full px-4 h-10 transition-all duration-300 hover:scale-105 flex items-center space-x-2"
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm font-bold hidden sm:inline">Call</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-md border-primary/20">
              <DropdownMenuItem onClick={() => joinCall(false)} className="cursor-pointer focus:bg-primary/10 focus:text-primary">
                <Phone className="w-4 h-4 mr-2" />
                <span>Audio Call</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => joinCall(true)} className="cursor-pointer focus:bg-primary/10 focus:text-primary">
                <Video className="w-4 h-4 mr-2" />
                <span>Video Call</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

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
