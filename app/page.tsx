"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
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
import { Loader2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "next-themes";
import { roomApi } from "@/lib/apiClient";

const FlowingDots = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    const dots: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
    }[] = [];
    const DOT_COUNT = 100;
    const CONNECTION_DISTANCE = 150;

    for (let i = 0; i < DOT_COUNT; i++) {
      dots.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Update and draw dots
      ctx.fillStyle = "rgba(99, 102, 241, 0.8)"; // Indigo
      ctx.strokeStyle = "rgba(99, 102, 241, 0.15)";

      dots.forEach((dot, i) => {
        dot.x += dot.vx;
        dot.y += dot.vy;

        // Bounce off edges
        if (dot.x < 0 || dot.x > width) dot.vx *= -1;
        if (dot.y < 0 || dot.y > height) dot.vy *= -1;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        ctx.fill();

        // Connect dots
        for (let j = i + 1; j < dots.length; j++) {
          const other = dots[j];
          const dx = dot.x - other.x;
          const dy = dot.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < CONNECTION_DISTANCE) {
            ctx.beginPath();
            ctx.moveTo(dot.x, dot.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none opacity-60"
    />
  );
};

export default function HomePage() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Wait for theme to be mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);

    // Call health check to wake up backend
    roomApi
      .healthCheck()
      .then((data) => console.log("Backend health check:", data))
      .catch((err) => console.error("Backend health check failed:", err));
  }, []);

  const handleJoin = async () => {
    if (!roomId.trim()) return;
    setIsLoading(true);
    // Simulate loading for better UX
    setTimeout(() => {
      router.push(`/room/${roomId}?username=${username || "anonymous"}`);
      setIsLoading(false);
    }, 1500);
  };

  // Determine which logo to show based on theme
  const logoSrc = !mounted
    ? "/icon-192x192.png"
    : theme === "light"
    ? "/icon-512x512.png"
    : "/icon-192x192.png";

  return (
    <div className="w-full h-full flex items-center justify-center min-h-screen bg-background p-4 sm:p-6 relative overflow-hidden selection:bg-primary/20">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-background to-background z-0"></div>
      <FlowingDots />

      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md mx-auto bg-card/30 backdrop-blur-xl border-white/10 shadow-2xl rounded-3xl relative z-10 sm:animate-float-slow overflow-hidden ring-1 ring-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

        <CardHeader className="text-center relative z-10 pt-10">
          <div className="mx-auto mb-6 relative w-32 h-32 flex items-center justify-center">
            <Image
              src={logoSrc}
              alt="Chillout"
              width={120}
              height={120}
              className="drop-shadow-2xl rounded-md"
            />
          </div>
          <CardTitle className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-400 to-primary">
            Chillout
          </CardTitle>
          <p className="text-muted-foreground mt-2 text-sm font-medium tracking-wide">
            Connect. Collaborate. Create.
          </p>
        </CardHeader>

        <CardContent className="space-y-6 relative z-10 px-8">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
              Display Name
            </label>
            <Input
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-background/80 border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary/50 focus-visible:border-primary/50 h-12 rounded-xl transition-all duration-300 hover:bg-background/90"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
              Room ID
            </label>
            <Input
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="bg-background/80 border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary/50 focus-visible:border-primary/50 h-12 rounded-xl transition-all duration-300 hover:bg-background/90"
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 relative z-10 pb-10 px-8">
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl h-12 text-base shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            onClick={handleJoin}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Enter Room"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
