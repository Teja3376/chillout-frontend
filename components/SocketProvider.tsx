"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

// 👇 Replace with your backend URL
// export const SOCKET_URL = "https://chillout-backend-v2.onrender.com";
export const SOCKET_URL = "http://localhost:5000";

const SocketContext = createContext<Socket | null>(null);
const OnlineUsersContext = createContext<string[]>([]);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

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

    // Listen for online users updates
    socketIo.on("online_users", (users: string[]) => {
      setOnlineUsers(users);
    });

    return () => {
      socketIo.disconnect();
    };
  }, []);

  if (!socket) return null;

  return (
    <SocketContext.Provider value={socket}>
      <OnlineUsersContext.Provider value={onlineUsers}>
        {children}
      </OnlineUsersContext.Provider>
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocket must be used within SocketProvider");
  return context;
};
export const useOnlineUsers = ({roomId }: {roomId?:string | undefined}) => {
  console.log(roomId);
  const context = useContext(OnlineUsersContext);
  return context;
};
