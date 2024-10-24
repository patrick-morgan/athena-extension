import React, { useState } from "react";
import { useAuth } from "../AuthContext";

export const SignInPrompt: React.FC = () => {
  const { signIn } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSignUp = () => {
    setIsSignUp(true);
  };

  const handleSignUpWithGoogle = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error("Error signing up with Google:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {!isSignUp ? (
        <div className="p-8 bg-white shadow-lg rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Welcome to Athena
          </h2>
          <p className="mb-6 text-gray-600">Please sign in to use Athena AI.</p>
          <div className="flex space-x-4">
            <button
              onClick={signIn}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Sign In
            </button>
            <button
              onClick={handleSignUp}
              className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              Sign Up
            </button>
          </div>
        </div>
      ) : (
        <div className="p-8 bg-white shadow-lg rounded-lg text-left max-w-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            Sign Up for Athena
          </h2>
          <p className="mb-4 text-gray-600">
            By signing up, you agree to our{" "}
            <a
              href="https://peoplespress.news/athena/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              Privacy Policy
            </a>
            .
          </p>
          <ul className="list-disc list-inside mb-4 text-gray-600">
            <li>Use Athena on actual articles for best results.</li>
            <li>
              Only the text content from the website you analyze is processed,
              and only when you click to start the analysis.
            </li>
            <li>
              Analyses are shared across users to provide deeper insights. Avoid
              analyzing private or sensitive information as it will potentially
              be visible to other users.
            </li>
          </ul>
          <button
            onClick={handleSignUpWithGoogle}
            className="flex items-center justify-center w-full px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className="w-4 h-4 mr-2"
            />
            Sign Up with Google
          </button>
        </div>
      )}
    </div>
  );
};
