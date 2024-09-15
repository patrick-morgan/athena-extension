import { auth } from "../../firebaseConfig";
import axiosInstance from "./axiosInstance";

// const api = axios.create({
//   baseURL: API_URL,
//   withCredentials: true,
// });

// Add an interceptor to include the Firebase ID token in requests
// api.interceptors.request.use(async (config) => {
//   const user = auth.currentUser;
//   if (user) {
//     const token = await user.getIdToken();
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export const checkSubscription = async () => {
//   const response = await axiosInstance.get("/check-subscription");
//   return response.data.isSubscribed;
// };

// export const createCheckoutSession = async () => {
//   const response = await axiosInstance.post("/create-checkout-session");
//   return response.data.checkoutUrl;
// };

// export const cancelSubscription = async () => {
//   const response = await axiosInstance.post("/cancel-subscription");
//   return response.data;
// };

// export const updatePaymentMethod = async () => {
//   const response = await axiosInstance.post("/update-payment-method");
//   return response.data.updateUrl;
// };

// export const checkSubscriptionStatus = async (
//   userId: string
// ): Promise<boolean> => {
//   try {
//     const response = await axiosInstance.get(`/check-subscription/${userId}`);
//     return response.data.isSubscribed;
//   } catch (error) {
//     console.error("Error checking subscription status:", error);
//     return false;
//   }
// };

// export const initiateSubscription = async (userId: string): Promise<string> => {
//   try {
//     const response = await axiosInstance.post(`/create-checkout-session`, {
//       userId,
//     });
//     return response.data.checkoutUrl;
//   } catch (error) {
//     console.error("Error initiating subscription:", error);
//     throw error;
//   }
// };

export const checkSubscription = async (): Promise<boolean> => {
  try {
    const response = await axiosInstance.get("/check-subscription");
    return response.data.isSubscribed;
  } catch (error) {
    console.error("Error checking subscription status:", error);
    throw error;
  }
};

//   export const createCheckoutSession = async () => {
//     const response = await axiosInstance.post("/create-checkout-session");
//     return response.data.checkoutUrl;
//   };

export const initiateSubscription = async (): Promise<string> => {
  try {
    const response = await axiosInstance.post("/create-checkout-session");
    return response.data.checkoutUrl;
  } catch (error) {
    console.error("Error initiating subscription:", error);
    throw error;
  }
};

export const cancelSubscription = async (): Promise<void> => {
  try {
    await axiosInstance.post("/cancel-subscription");
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    throw error;
  }
};

export const updatePaymentMethod = async (): Promise<string> => {
  try {
    const response = await axiosInstance.post("/update-payment-method");
    return response.data.updateUrl;
  } catch (error) {
    console.error("Error updating payment method:", error);
    throw error;
  }
};
