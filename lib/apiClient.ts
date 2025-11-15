"use client";

import axios from "axios";

const getAuthToken = () => {
  if (typeof window !== "undefined") {
    try {
      return window.sessionStorage?.getItem("accessToken");
    } catch (error) {
      console.warn("Failed to access sessionStorage:", error);
      return null;
    }
  }
  return null;
};

// Create an Axios instance
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  // baseURL: "https://chillout-backend-v2.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 120000, // 2 minutes timeout
});

// Request Interceptor: Attach token from sessionStorage
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // const tenantId = getTenantId();
    // if (tenantId) {
    //   config.headers['x-tenant-id'] = tenantId;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// Basic Response Error Handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error("Network error: No response received.");
      return Promise.reject({ message: "Network Error" });
    }
    return Promise.reject(error);
  }
);

export default api;

/**
 * Message data interface.
 */
interface Message {
  username: string;
  message: string;
  type: string;
  createdAt: string;
  url?: string;
}

/**
 * Room data interface.
 */
interface Room {
  _id: string;
  roomId: string;
  messages: Message[];
}

/**
 * Room-related API methods using Axios.
 */
export const roomApi = {
  /**
   * Retrieves a room by roomId, creating it if it doesn't exist.
   * @param roomId - ID of the room.
   * @returns Promise resolving to the room data.
   */
  getRoom: (roomId: string) =>
    api.get<Room>(`/room/${roomId}`).then((res) => res.data),

  /**
   * Uploads a voice file for a room.
   * @param roomId - ID of the room.
   * @param username - Username of the sender.
   * @param voiceFile - The voice file blob.
   * @returns Promise resolving to the upload response.
   */
  uploadVoice: (roomId: string, username: string, voiceFile: Blob) => {
    const formData = new FormData();
    formData.append("voice", voiceFile);
    formData.append("username", username);
    return api
      .post(`/room/${roomId}/voice`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data);
  },
};
