"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

// 👇 Replace with your backend URL
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "https://chillout-backend-v2.onrender.com";

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Connect to backend
    const socketIo = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    setSocket(socketIo);

    socketIo.on("connect", () => {
      console.log("✅ Connected to socket:", socketIo.id);
    });

    socketIo.on("disconnect", () => {
      console.log("❌ Disconnected from socket");
    });

    return () => {
      socketIo.disconnect();
    };
  }, []);

  if (!socket) return null;

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocket must be used within SocketProvider");
  return context;
};
