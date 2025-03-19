import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export interface RoomResponse {
  id: string;
  name: string;
  url: string;
  privacy: string;
  created_at: string;
  config?: Record<string, any>;
}

export const api = {
  createRoom: async (name?: string): Promise<RoomResponse> => {
    const response = await axios.post(`${API_BASE_URL}/rooms`, { name });
    return response.data;
  },

  getRoom: async (roomName: string): Promise<RoomResponse> => {
    const response = await axios.get(`${API_BASE_URL}/rooms/${roomName}`);
    return response.data;
  }
}; 