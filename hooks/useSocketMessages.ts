import { useState, useEffect } from "react";
import { useSocket } from "@/components/SocketProvider";
import { SOCKET_URL } from "@/components/SocketProvider";

interface Message {
  _id?: string;
  username: string;
  message: string;
  type?: string;
  url?: string;
  callInitiator?: string;
}

export function useSocketMessages(roomId: string, username: string) {
  const socket = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("join_room", { roomId, username });

    // Text messages
    socket.on("receive_message", (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    // Voice messages
    socket.on("receive_voice_message", (data: Message) => {
      setMessages((prev) => [
        ...prev,
        {
          ...data,
          url: data.url
            ? data.url.startsWith("http")
              ? data.url
              : `${SOCKET_URL}${data.url}`
            : undefined,
        },
      ]);
    });

    // Image messages
    socket.on("receive_image_message", (data: Message) => {
      setMessages((prev) => [
        ...prev,
        {
          ...data,
          url: data.url
            ? data.url.startsWith("http")
              ? data.url
              : `${SOCKET_URL}${data.url}`
            : undefined,
        },
      ]);
    });

    // Call notifications
    socket.on("call_notification", (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("call_ended_notification", (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    // Message deletion
    socket.on("message_deleted", ({ messageId }: { messageId: string }) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    });

    return () => {
      socket.off("receive_message");
      socket.off("receive_voice_message");
      socket.off("receive_image_message");
      socket.off("call_notification");
      socket.off("call_ended_notification");
      socket.off("message_deleted");
    };
  }, [socket, roomId, username]);

  const sendMessage = (message: string) => {
    if (!socket || !message.trim()) return;
    socket.emit("send_message", { roomId, username, message });
  };

  const deleteMessage = (messageId: string) => {
    if (!socket) return;
    socket.emit("delete_message", { roomId, messageId });
  };

  return {
    messages,
    setMessages,
    sendMessage,
    deleteMessage,
  };
}
