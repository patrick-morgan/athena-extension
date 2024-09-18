import axios, { AxiosInstance } from "axios";
import { getIdToken } from "../../firebaseConfig";

const API_URL =
  process.env.NODE_ENV === "production"
    ? process.env.EXPRESS_API_URL
    : "http://localhost:3000";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getIdToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
