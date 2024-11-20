import React, { useState } from "react";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";
import { Button } from "./ui/button";

export const SignInPrompt: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="p-8 bg-white shadow-lg rounded-lg text-center max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {isSignUp ? "Create an Account" : "Welcome Back"}
        </h2>
        <p className="mb-6 text-gray-600">
          {isSignUp
            ? "Sign up to start using Athena AI"
            : "Please sign in to use Athena AI"}
        </p>

        {isSignUp ? <SignUpForm /> : <SignInForm />}

        <div className="mt-4">
          <Button variant="ghost" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp
              ? "Already have an account? Sign in"
              : "Need an account? Sign up"}
          </Button>
        </div>
      </div>
    </div>
  );
};
