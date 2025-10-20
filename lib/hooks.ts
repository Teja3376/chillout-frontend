import { useState, useEffect } from "react";
import api, { roomApi } from "./apiClient";

// Define types for better type safety
interface Room {
  _id: string;
  roomId: string;
  messages: {
    username: string;
    message: string;
    type: string;
    createdAt: string;
  }[];
}

// Custom hook for getting a room
export const useGetRoom = (roomId: string) => {
  const [data, setData] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const fetchRoom = async () => {
      try {
        setLoading(true);
        const response = await roomApi.getRoom(roomId);
        setData(response);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  return { data, loading, error };
};

// Hook for creating a room (if needed, assuming POST endpoint exists)
export const useCreateRoom = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (roomData: { roomId: string }) => {
    try {
      setLoading(true);
      const response = await api.post("/room", roomData);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
};
