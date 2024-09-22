import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export const SupportPage: React.FC = () => {
  const handleEmailClick = () => {
    window.location.href = "mailto:pmo@peoplespress.news";
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Support</h1>
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>
            We're here to assist you with any issues or questions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            If you're experiencing any problems or have questions about Athena,
            please don't hesitate to reach out to our support team.
          </p>
          <Button onClick={handleEmailClick} className="w-full">
            <Mail className="mr-2 h-4 w-4" />
            Contact Support
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
