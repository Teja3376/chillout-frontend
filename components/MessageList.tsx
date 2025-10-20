import MessageItem from "./MessageItem";

interface Message {
  username: string;
  message: string;
}

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto">
      {messages.map((msg, idx) => (
        <MessageItem key={idx} username={msg.username} message={msg.message} />
      ))}
    </div>
  );
}
