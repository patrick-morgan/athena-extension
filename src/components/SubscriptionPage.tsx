import React from "react";
import { useAuth } from "../AuthContext";
import { initiateSubscription } from "../api/stripe";

export const SubscriptionPage: React.FC = () => {
  const { user } = useAuth();

  const handleSubscribe = async () => {
    if (user) {
      try {
        const checkoutUrl = await initiateSubscription();
        window.open(checkoutUrl, "_blank");
      } catch (error) {
        console.error("Error initiating subscription:", error);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full mt-12">
      <h1 className="text-2xl font-bold mb-4">Upgrade to Premium</h1>
      <p className="text-lg mb-6">
        Get full access to Athena AI for just $5/month
      </p>
      <button
        onClick={handleSubscribe}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Subscribe Now
      </button>
    </div>
  );
};
