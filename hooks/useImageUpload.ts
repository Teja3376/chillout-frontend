import { useState } from "react";
import { useSocket } from "@/components/SocketProvider";
import { roomApi } from "@/lib/apiClient";
import { SOCKET_URL } from "@/components/SocketProvider";

export function useImageUpload(roomId: string, username: string) {
  const socket = useSocket();
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isSendingImage, setIsSendingImage] = useState(false);

  const handleImageSelect = (file: File) => {
    setSelectedImageFile(file);
  };

  const sendSelectedImage = async () => {
    if (!selectedImageFile || isSendingImage || !socket) return;

    setIsSendingImage(true);
    try {
      const response = await roomApi.uploadImage(roomId, username, selectedImageFile);
      socket.emit("send_image_message", {
        roomId,
        username,
        url: `${SOCKET_URL}${response.url}`,
      });
      setSelectedImageFile(null);
    } catch (error) {
      console.error("Error sending image:", error);
    } finally {
      setIsSendingImage(false);
    }
  };

  const discardImage = () => {
    setSelectedImageFile(null);
  };

  return {
    selectedImageFile,
    isSendingImage,
    handleImageSelect,
    sendSelectedImage,
    discardImage,
  };
}
