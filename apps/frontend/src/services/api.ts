import axios from "axios";
import { toast } from "sonner";
import { useAuthStore } from "../store/auth";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000/api"
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const message = error.response?.data?.message ?? "Yêu cầu thất bại";
    toast.error(message);
    return Promise.reject(error);
  }
);
