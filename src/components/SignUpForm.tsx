import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle, Check, X, Mail } from "lucide-react";
import { logger } from "@/logger";

interface PasswordRequirement {
  label: string;
  validator: (password: string) => boolean;
  met: boolean;
}

const getReadableError = (error: Error): string => {
  const errorCode = (error as any)?.code || error.message;

  const errorMessages: { [key: string]: string } = {
    "auth/email-already-in-use":
      "An account with this email already exists. Please sign in instead.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/operation-not-allowed":
      "Email/password accounts are not enabled. Please contact support.",
    "auth/weak-password": "Please choose a stronger password.",
    "auth/network-request-failed":
      "Network error. Please check your internet connection.",
    // Add more error codes as needed
  };

  return (
    errorMessages[errorCode] ||
    "An unexpected error occurred. Please try again."
  );
};

export const SignUpForm: React.FC = () => {
  const { signUp, user, isEmailVerified, resendVerificationEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  logger.log("isEmailVerified", isEmailVerified);

  const [requirements, setRequirements] = useState<PasswordRequirement[]>([
    {
      label: "At least 8 characters long",
      validator: (pwd) => pwd.length >= 8,
      met: false,
    },
    {
      label: "Contains at least one uppercase letter",
      validator: (pwd) => /[A-Z]/.test(pwd),
      met: false,
    },
    {
      label: "Contains at least one number",
      validator: (pwd) => /[0-9]/.test(pwd),
      met: false,
    },
    {
      label: "Contains at least one special character",
      validator: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
      met: false,
    },
  ]);

  useEffect(() => {
    setRequirements((prev) =>
      prev.map((req) => ({
        ...req,
        met: req.validator(password),
      }))
    );
  }, [password]);

  const isPasswordValid = requirements.every((req) => req.met);
  const doPasswordsMatch = password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isPasswordValid) {
      setError("Please meet all password requirements");
      return;
    }

    if (!doPasswordsMatch) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      await signUp(email, password);
      setIsSuccess(true);
    } catch (err) {
      console.error("Sign up error:", err);
      setError(getReadableError(err as Error));
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await resendVerificationEmail();
      setResendDisabled(true);
      setResendCountdown(60);
    } catch (err) {
      setError("Failed to resend verification email. Please try again later.");
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

  // If user has successfully signed up, show verification message
  if (isSuccess && user && !isEmailVerified) {
    return (
      <div className="space-y-4">
        <Alert className="bg-green-50 border-green-200">
          <Mail className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            <p className="font-medium">Account created successfully!</p>
            <p className="mt-2">
              A verification email has been sent to {user.email}. Please check
              your inbox and click the verification link to activate your
              account.
            </p>
          </AlertDescription>
        </Alert>

        <div className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            Didn't receive the email? Check your spam folder or click below to
            resend.
          </p>
          <Button
            onClick={handleResendVerification}
            disabled={resendDisabled}
            variant="outline"
            className="w-full"
          >
            {resendDisabled
              ? `Resend available in ${resendCountdown}s`
              : "Resend Verification Email"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="space-y-1">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={password && !isPasswordValid ? "border-red-500" : ""}
          />

          <div className="space-y-2 mt-2">
            {requirements.map((req, index) => (
              <div
                key={index}
                className={`flex items-center text-sm ${
                  req.met ? "text-green-600" : "text-gray-500"
                }`}
              >
                {req.met ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <X className="h-4 w-4 mr-2" />
                )}
                {req.label}
              </div>
            ))}
          </div>
        </div>

        <Input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className={
            confirmPassword && !doPasswordsMatch ? "border-red-500" : ""
          }
        />
        {confirmPassword && !doPasswordsMatch && (
          <p className="text-sm text-red-500">Passwords do not match</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || !isPasswordValid || !doPasswordsMatch}
      >
        {isLoading ? "Creating account..." : "Sign Up"}
      </Button>
    </form>
  );
};
