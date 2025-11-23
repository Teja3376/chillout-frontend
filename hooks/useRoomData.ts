import { useQuery } from "@tanstack/react-query";
import { roomApi } from "@/lib/apiClient";

export function useRoomData(roomId: string) {
  return useQuery({
    queryKey: ["room", roomId],
    queryFn: () => roomApi.getRoom(roomId),
    enabled: !!roomId,
    staleTime: 30 * 1000, // 30 seconds
  });
}
