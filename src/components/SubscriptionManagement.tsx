import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import {
  checkSubscription,
  cancelSubscription,
  updatePaymentMethod,
  initiateSubscription,
} from "../api/stripe";

export const SubscriptionManagement: React.FC = () => {
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (user) {
        try {
          const status = await checkSubscription();
          setIsSubscribed(status);
        } catch (error) {
          console.error("Error fetching subscription status:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSubscriptionStatus();
  }, [user]);

  const handleSubscribe = async () => {
    try {
      const checkoutUrl = await initiateSubscription();
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Error creating checkout session:", error);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription();
      setIsSubscribed(false);
    } catch (error) {
      console.error("Error cancelling subscription:", error);
    }
  };

  const handleUpdatePaymentMethod = async () => {
    try {
      const updateUrl = await updatePaymentMethod();
      window.location.href = updateUrl;
    } catch (error) {
      console.error("Error updating payment method:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Subscription Management</h2>
      {isSubscribed ? (
        <div>
          <p className="mb-4">You are currently subscribed to Athena AI.</p>
          <button
            onClick={handleCancelSubscription}
            className="bg-red-500 text-white px-4 py-2 rounded mr-2"
          >
            Cancel Subscription
          </button>
          <button
            onClick={handleUpdatePaymentMethod}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Update Payment Method
          </button>
        </div>
      ) : (
        <div>
          <p className="mb-4">You are not currently subscribed to Athena AI.</p>
          <button
            onClick={handleSubscribe}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Subscribe Now
          </button>
        </div>
      )}
    </div>
  );
};
