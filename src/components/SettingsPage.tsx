import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import React from "react";
import { initiateSubscription } from "../api/stripe";
import { useAuth } from "../AuthContext";

export const SettingsPage: React.FC = () => {
  const { user, isSubscribed } = useAuth();

  const handleSubscribe = async () => {
    try {
      const checkoutUrl = await initiateSubscription();
      window.open(checkoutUrl, "_blank");
      // logEvent("subscription_initiated", { userId: user?.uid });
    } catch (error) {
      console.error("Error initiating subscription:", error);
      // logEvent("subscription_error", {
      //   error: (error as Error).message,
      // });
    }
  };

  const handleUpdatePaymentMethod = async () => {
    try {
      // const updateUrl = await updatePaymentMethod();
      const updateUrl = "https://billing.stripe.com/p/login/eVa2bl3Rd4MK05GeUU";
      chrome.tabs.create({ url: updateUrl });
      // logEvent("payment_method_update_initiated", {
      //   userId: user?.uid,
      // });
    } catch (error: any) {
      console.error("Error updating payment method:", error);
      // logEvent("payment_method_update_error", {
      //   error: error.message,
      // });
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
