import React, { useState } from "react";
import { useAuth } from "../AuthContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle } from "lucide-react";
import { resetPassword } from "../../firebaseConfig";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const getReadableError = (error: Error): string => {
  const errorCode = (error as any)?.code || error.message;

  const errorMessages: { [key: string]: string } = {
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/user-disabled":
      "This account has been disabled. Please contact support.",
    "auth/user-not-found":
      "No account found with this email. Please check your email or sign up.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/too-many-requests":
      "Too many failed attempts. Please try again later.",
    "auth/network-request-failed":
      "Network error. Please check your internet connection.",
    "auth/invalid-credential":
      "Invalid login credentials. Please check your email and password.",
    "auth/invalid-login-credentials":
      "Invalid login credentials. Please check your email and password.",
    // Add more error codes as needed
  };

  return (
    errorMessages[errorCode] ||
    "An unexpected error occurred. Please try again."
  );
};

export const SignInForm: React.FC = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signIn(email, password);
    } catch (err) {
      console.error("Sign in error:", err);
      setError(getReadableError(err as Error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(false);
    setIsResetting(true);

    try {
      await resetPassword(resetEmail);
      setResetSuccess(true);
      // Clear the reset email field
      setResetEmail("");
      // Close the dialog after 3 seconds
      setTimeout(() => {
        setIsResetDialogOpen(false);
        setResetSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Password reset error:", err);
      setResetError(getReadableError(err as Error));
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
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
            className="w-full"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full"
          />
          <Button
            type="button"
            variant="link"
            className="px-0 text-sm text-muted-foreground hover:text-primary"
            onClick={() => {
              setIsResetDialogOpen(true);
              setResetEmail(email); // Pre-fill with login email if exists
            }}
          >
            Forgot password?
          </Button>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !email || !password}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your
              password.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleResetPassword} className="space-y-4">
            {resetError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{resetError}</AlertDescription>
              </Alert>
            )}

            {resetSuccess && (
              <Alert className="bg-green-50 text-green-700 border-green-200">
                <AlertDescription>
                  Password reset email sent! Please check your inbox.
                </AlertDescription>
              </Alert>
            )}

            <Input
              type="email"
              placeholder="Email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
              disabled={isResetting || resetSuccess}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsResetDialogOpen(false)}
                disabled={isResetting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isResetting || resetSuccess || !resetEmail}
              >
                {isResetting ? "Sending..." : "Send Reset Link"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
