import { Card, CardContent } from "@/components/ui/card";

interface MessageItemProps {
  username: string;
  message: string;
}

export default function MessageItem({ username, message }: MessageItemProps) {
  return (
    <Card className="bg-gray-800 mb-2">
      <CardContent>
        <strong>{username}:</strong> {message}
      </CardContent>
    </Card>
  );
}
