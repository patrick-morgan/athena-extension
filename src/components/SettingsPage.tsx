import React from "react";
import { useAuth } from "../AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, AlertCircle } from "lucide-react";
import {
  cancelSubscription,
  initiateSubscription,
  updatePaymentMethod,
} from "../api/stripe";

export const SettingsPage: React.FC = () => {
  const { user, isSubscribed, checkSubscriptionStatus } = useAuth();

  const handleSubscribe = async () => {
    try {
      const checkoutUrl = await initiateSubscription();
      window.open(checkoutUrl, "_blank");
    } catch (error) {
      console.error("Error initiating subscription:", error);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription();
      await checkSubscriptionStatus(user);
    } catch (error) {
      console.error("Error cancelling subscription:", error);
    }
  };

  const handleUpdatePaymentMethod = async () => {
    try {
      // const updateUrl = await updatePaymentMethod();
      const updateUrl = "https://billing.stripe.com/p/login/eVa2bl3Rd4MK05GeUU";
      chrome.tabs.create({ url: updateUrl });
    } catch (error: any) {
      console.error("Error updating payment method:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.details
      ) {
        // This is our custom error message for unconfigured Customer Portal
        alert(
          "Unable to update payment method at this time. Please try restarting the chrome extension, or contacting pmo@peoplespress.news" +
            error.response.data.error
        );
      } else {
        alert(
          "An error occurred while trying to update the payment method. Please try restarting the chrome extension, or contacting pmo@peoplespress.news"
        );
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Manage your Athena subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold">Current Plan</p>
              <p className="text-sm text-gray-500">
                {isSubscribed ? "Premium" : "Free"}
              </p>
            </div>
            {isSubscribed ? (
              <Badge variant="default" className="bg-green-500">
                Active
              </Badge>
            ) : (
              <Badge variant="secondary">Inactive</Badge>
            )}
          </div>
          {isSubscribed ? (
            <>
              <Button
                variant="outline"
                className="w-full mb-2"
                onClick={handleUpdatePaymentMethod}
              >
                <CreditCard className="mr-2 h-4 w-4" /> Manage Subscription
              </Button>
              {/* <Button
                variant="destructive"
                className="w-full"
                onClick={handleCancelSubscription}
              >
                <AlertCircle className="mr-2 h-4 w-4" /> Cancel Subscription
              </Button> */}
            </>
          ) : (
            <Button className="w-full" onClick={handleSubscribe}>
              Subscribe to Premium
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
