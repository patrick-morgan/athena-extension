import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { Button } from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Mail, AlertCircle } from "lucide-react";

export const EmailVerificationPrompt: React.FC = () => {
  const { user, resendVerificationEmail } = useAuth();
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleResendVerification = async () => {
    try {
      await resendVerificationEmail();
      setResendDisabled(true);
      setResendCountdown(60);
      setSuccess("Verification email sent! Please check your inbox.");
      setError(null);
    } catch (err) {
      setError("Failed to resend verification email. Please try again later.");
      setSuccess(null);
    }
  };

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (resendCountdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [resendCountdown, resendDisabled]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="p-8 bg-white shadow-lg rounded-lg text-center max-w-md w-full">
        <Mail className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Verify Your Email
        </h2>
        <p className="mb-6 text-gray-600">
          We've sent a verification email to <strong>{user?.email}</strong>.
          Please check your inbox and click the verification link to activate
          your account.
        </p>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200 mb-4">
            <Mail className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Didn't receive the email? Check your spam folder or click below to
            resend.
          </p>
          <Button
            onClick={handleResendVerification}
            disabled={resendDisabled}
            className="w-full"
          >
            {resendDisabled
              ? `Resend available in ${resendCountdown}s`
              : "Resend Verification Email"}
          </Button>
        </div>
      </div>
    </div>
  );
};
