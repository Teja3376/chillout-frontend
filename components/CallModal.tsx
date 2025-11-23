"use client";

import React, { useState, useRef, useEffect } from "react";
import { useCall } from "./CallProvider";
import { Mic, MicOff, PhoneOff, Minimize2, Maximize2, Video, VideoOff, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function CallModal() {
  const { isInCall, leaveCall, participants, isMuted, toggleMute, localStream, remoteStreams, peerUsernames, isVideoEnabled, toggleVideo, toggleCamera } = useCall();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const constraintsRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!isInCall) return null;

  // Helper to render video or avatar
  const renderParticipantMedia = (stream: MediaStream | null, username: string, isLocal: boolean = false) => {
    const hasVideo = stream && stream.getVideoTracks().length > 0 && stream.getVideoTracks()[0].enabled;
    
    // For local stream, we check our own state
    const showVideo = isLocal ? isVideoEnabled : hasVideo;

    return (
      <div className="relative w-full h-full bg-black/40 flex items-center justify-center overflow-hidden rounded-xl border border-white/10 group">
        {showVideo && stream ? (
          <video
            ref={(el) => {
              if (el) {
                el.srcObject = stream;
                if (isLocal) el.muted = true; // Mute local video to prevent feedback
              }
            }}
            autoPlay
            playsInline
            className={`w-full h-full object-cover ${isLocal ? "scale-x-[-1]" : ""}`}
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border-2 border-primary/40 flex items-center justify-center text-2xl font-bold text-foreground shadow-lg backdrop-blur-sm">
              {username.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
        
        {/* Name Tag */}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 flex items-center gap-2">
           <span className="text-xs font-medium text-white">{username} {isLocal && "(You)"}</span>
           {!showVideo && <VideoOff className="w-3 h-3 text-red-400" />}
           {/* We can add mute status here if we track it per user */}
        </div>

        {/* Audio Indicator (Simple visualizer placeholder) */}
        <div className="absolute top-3 right-3">
             <div className={`w-2 h-2 rounded-full ${isLocal ? (isMuted ? "bg-red-500" : "bg-green-500") : "bg-green-500"} animate-pulse`} />
        </div>
      </div>
    );
  };


  // Grid calculation
  const totalParticipants = participants.length;
  
  const getGridClass = (count: number) => {
      if (count === 1) return "grid-cols-1 grid-rows-1";
      if (count === 2) return "grid-cols-1 grid-rows-2 sm:grid-cols-2 sm:grid-rows-1";
      if (count <= 4) return "grid-cols-2 grid-rows-2";
      return "grid-cols-2 sm:grid-cols-3 auto-rows-fr";
  };

  return (
    <>
      {/* Constraint area for dragging */}
      <div ref={constraintsRef} className="fixed top-16 bottom-24 left-0 right-0 pointer-events-none z-0" />

      <AnimatePresence mode="wait">
        {isMinimized ? (
          <motion.div
            key="minimized"
            drag={!isMobile}
            dragConstraints={constraintsRef}
            dragMomentum={false}
            initial={{ scale: 0.8, opacity: 0, y: 100 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 100 }}
            className="fixed bottom-28 right-4 z-50 pointer-events-auto cursor-grab active:cursor-grabbing"
          >
            <div className="bg-card/90 backdrop-blur-md border border-primary/20 rounded-full p-2 shadow-xl ring-1 ring-white/10 flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-30"></span>
                <span className="relative font-bold text-primary text-xs">{participants.length}</span>
              </div>
              <div className="flex flex-col mr-2">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Call</span>
                <span className="text-[10px] text-muted-foreground">{isMuted ? "Muted" : "Active"}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-primary/10"
                onClick={() => setIsMinimized(false)}
              >
                <Maximize2 className="w-4 h-4 text-primary" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            drag={!isMobile}
            dragConstraints={!isMobile ? constraintsRef : undefined}
            dragMomentum={false}
            initial={!isMobile ? { opacity: 0, scale: 0.95, y: 20 } : false}
            animate={!isMobile ? { opacity: 1, scale: 1, y: 0 } : {}}
            exit={!isMobile ? { opacity: 0, scale: 0.95, y: 20 } : {}}
            className={`fixed z-50 overflow-hidden pointer-events-auto flex flex-col transition-all duration-300 ${
              isMobile 
                ? "inset-0 bg-background" 
                : "top-20 bottom-24 right-4 left-4 sm:left-auto sm:w-[800px] sm:h-[600px] bg-card/95 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-2xl ring-1 ring-white/10"
            }`}
          >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-bold text-white/90">
                        {participants.length} Participant{participants.length !== 1 && 's'}
                    </span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="pointer-events-auto h-8 w-8 rounded-full bg-black/40 hover:bg-white/10 text-white border border-white/10"
                    onClick={() => setIsMinimized(true)}
                >
                    <Minimize2 className="w-4 h-4" />
                </Button>
            </div>

            {/* Main Grid */}
            <div className={`flex-1 p-2 sm:p-4 grid gap-2 sm:gap-4 overflow-hidden ${getGridClass(totalParticipants)}`}>
                {/* Local User */}
                <div className="w-full h-full min-h-0">
                    {renderParticipantMedia(localStream, "You", true)}
                </div>

                {/* Remote Users */}
                {Array.from(remoteStreams.entries()).map(([socketId, stream]) => {
                    const username = peerUsernames.get(socketId) || "Unknown User";
                    return (
                        <div key={socketId} className="w-full h-full min-h-0">
                            {renderParticipantMedia(stream, username, false)}
                        </div>
                    );
                })}
            </div>

            {/* Controls Bar */}
            <div className="p-6 flex justify-center items-center gap-6 bg-black/40 backdrop-blur-md border-t border-white/10">
                <Button
                    variant={isMuted ? "destructive" : "secondary"}
                    size="icon"
                    className={`rounded-full w-14 h-14 shadow-lg transition-all ${
                        isMuted 
                        ? "bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/50" 
                        : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                    }`}
                    onClick={toggleMute}
                >
                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </Button>

                <Button
                    onClick={toggleVideo}
                    variant={isVideoEnabled ? "default" : "destructive"}
                    className={`rounded-full w-14 h-14 shadow-lg transition-all ${
                        isVideoEnabled 
                        ? "bg-primary hover:bg-primary/90" 
                        : "bg-red-500 hover:bg-red-600"
                    }`}
                >
                    {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                </Button>

                {/* Switch Camera Button (Mobile Only) */}
                <Button
                    onClick={toggleCamera}
                    variant="secondary"
                    className="rounded-full w-14 h-14 flex md:hidden items-center justify-center transition-all duration-300 bg-secondary/80 hover:bg-secondary"
                >
                    <RefreshCw className="w-6 h-6" />
                </Button>

                <Button
                    variant="destructive"
                    size="icon"
                    className="rounded-full w-16 h-16 shadow-2xl bg-red-600 hover:bg-red-700 text-white border-4 border-red-500/30"
                    onClick={leaveCall}
                >
                    <PhoneOff className="w-8 h-8" />
                </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
