import axiosInstance from "./axiosInstance";

export const checkSubscription = async (): Promise<boolean> => {
  try {
    const response = await axiosInstance.get("/check-subscription");
    return response.data.isSubscribed;
  } catch (error) {
    console.error("Error checking subscription status:", error);
    throw error;
  }
};

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
