"use client";

import React, { useState, useRef, useEffect } from "react";
import { useCall } from "./CallProvider";
import { Mic, MicOff, PhoneOff, Minimize2, Maximize2, GripHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function CallModal() {
  const { isInCall, leaveCall, participants, isMuted, toggleMute } = useCall();
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

  return (
    <>
      {/* Constraint area for dragging - restricted to chat area (below header, above input) */}
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
                ? "inset-0 bg-gradient-to-b from-primary/20 via-background to-background" 
                : "bottom-24 right-4 w-80 bg-card/95 backdrop-blur-md border border-primary/20 rounded-2xl shadow-2xl ring-1 ring-white/10"
            }`}
          >
            {/* Mobile Header - Compact */}
            {isMobile ? (
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-lg font-bold text-primary">Voice Chat</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full hover:bg-primary/10"
                  onClick={() => setIsMinimized(true)}
                >
                  <Minimize2 className="w-5 h-5 text-muted-foreground" />
                </Button>
              </div>
            ) : (
              /* Desktop Header */
              <div className="bg-primary/10 p-4 border-b border-primary/10 flex justify-between items-center cursor-grab active:cursor-grabbing">
                <div className="flex items-center gap-2">
                  <GripHorizontal className="w-4 h-4 text-muted-foreground/50" />
                  <h3 className="font-bold text-primary flex items-center gap-2 text-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Voice Chat
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-primary/10"
                    onClick={() => setIsMinimized(true)}
                  >
                    <Minimize2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            )}

            {/* Participants - Different layouts for mobile vs desktop */}
            {isMobile ? (
              /* Mobile: Conference call style with circular arrangement */
              <div className="flex-1 flex flex-col items-center justify-center px-8 py-4">
                <div className="relative w-full max-w-sm aspect-square flex items-center justify-center mb-8">
                  {participants.map((user, index) => {
                    const angle = (index * 360) / participants.length;
                    const radius = participants.length > 2 ? 35 : 25;
                    const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
                    const y = Math.sin((angle - 90) * Math.PI / 180) * radius;
                    
                    return (
                      <div
                        key={user}
                        className="absolute"
                        style={{
                          left: `calc(50% + ${x}%)`,
                          top: `calc(50% + ${y}%)`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse"></div>
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border-4 border-primary/40 flex items-center justify-center text-3xl font-bold text-foreground shadow-2xl relative z-10 backdrop-blur-sm">
                              {user.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <span className="text-sm font-medium text-foreground/80 bg-background/60 px-3 py-1 rounded-full backdrop-blur-sm">
                            {user}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Desktop: Grid layout */
              <div className="p-4 overflow-y-auto">
                <div className="grid grid-cols-3 gap-3">
                  {participants.map((user) => (
                    <div key={user} className="flex flex-col items-center gap-1">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping opacity-0 group-hover:opacity-100" /> 
                        <div className="w-12 h-12 rounded-full bg-accent/50 border border-primary/20 flex items-center justify-center text-lg font-bold text-foreground shadow-sm relative group z-10">
                          {user.charAt(0).toUpperCase()}
                          <div className="absolute inset-0 rounded-full border-2 border-primary opacity-0 transition-opacity duration-300" />
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground truncate w-full text-center font-medium">
                        {user}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Controls - Different for mobile vs desktop */}
            {isMobile ? (
              /* Mobile: Conference call style controls */
              <div className="pb-8 px-8 space-y-6">
                <div className="flex justify-center gap-8">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-full w-16 h-16 shadow-lg transition-all ${
                      isMuted 
                        ? "bg-red-500/20 text-red-500 hover:bg-red-500/30 border-2 border-red-500/50" 
                        : "bg-primary/10 text-primary hover:bg-primary/20 border-2 border-primary/30"
                    }`}
                    onClick={toggleMute}
                  >
                    {isMuted ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
                  </Button>
                </div>
                
                <div className="flex justify-center">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="rounded-full w-20 h-20 shadow-2xl bg-red-600 hover:bg-red-700 text-white border-4 border-red-500/30"
                    onClick={leaveCall}
                  >
                    <PhoneOff className="w-10 h-10" />
                  </Button>
                </div>
              </div>
            ) : (
              /* Desktop: Compact controls */
              <div className="p-4 bg-background/50 border-t border-primary/10 flex justify-center gap-6">
                <Button
                  variant={isMuted ? "destructive" : "secondary"}
                  size="icon"
                  className={`rounded-full w-12 h-12 shadow-md transition-all ${
                    isMuted ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" : "bg-accent hover:bg-accent/80"
                  }`}
                  onClick={toggleMute}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="rounded-full w-12 h-12 shadow-md bg-red-600 hover:bg-red-700 text-white"
                  onClick={leaveCall}
                >
                  <PhoneOff className="w-5 h-5" />
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
