"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { useSocket } from "@/components/SocketProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetRoom } from "@/lib/hooks";

export default function RoomPage() {
  const { roomId } = useParams();
  const searchParams = useSearchParams();
  const username = searchParams.get("username") || "anonymous";
  const socket = useSocket();

  const { data: roomData } = useGetRoom(roomId as string);

  const [messages, setMessages] = useState<
    { username: string; message: string }[]
  >([]);
  const [newMessage, setNewMessage] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (roomData) {
      setMessages(roomData.messages);
    }
  }, [roomData]);

  useEffect(() => {
    socket.emit("join_room", { roomId, username });

    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, [socket, roomId, username]);

  useEffect(() => {
    // auto scroll to bottom when new message arrives
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim() === "") return;
    socket.emit("send_message", { roomId, username, message: newMessage });
    setNewMessage("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-pink-50 to-cyan-50">
      {/* Header */}
      <header className="p-4 bg-white/70 backdrop-blur-md shadow-md border-b border-gray-200">
        <h1 className="text-2xl font-bold text-indigo-600">Room: {roomId}</h1>
        <h2 className="text-sm text-gray-500">Logged in as {username}</h2>
      </header>

      {/* Messages Section */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.username === username ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-2xl shadow-sm ${
                msg.username === username
                  ? "bg-gradient-to-r from-indigo-500 to-pink-500 text-white rounded-br-none"
                  : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
              }`}
            >
              <p className="text-xs font-semibold opacity-70">
                {msg.username === username ? "You" : msg.username}
              </p>
              <p className="break-words">{msg.message}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Section */}
      <footer className="p-4 bg-white/80 backdrop-blur-md border-t border-gray-200 flex gap-2">
        <Input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 rounded-xl"
        />
        <Button
          onClick={sendMessage}
          className="rounded-xl bg-indigo-500 hover:bg-indigo-600 hover:opacity-90 text-white font-semibold shadow-md"
        >
          Send
        </Button>
      </footer>
    </div>
  );
}
