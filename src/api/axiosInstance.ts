// src/api/axiosInstance.ts

import axios, { AxiosInstance } from "axios";
import { getAuth } from "firebase/auth";

export const API_URL = process.env.EXPRESS_API_URL || "http://localhost:3000";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // If you need to send cookies with your requests
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optionally, add a response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is due to an invalid token (401 status) and we haven't retried yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        // Force refresh the token
        await user.getIdToken(true);
        // Retry the original request with the new token
        return axiosInstance(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
