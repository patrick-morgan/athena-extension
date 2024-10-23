import React from "react";
import { useAuth } from "../AuthContext";

export const SignInPrompt: React.FC = () => {
  const { signIn } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="p-8 bg-white shadow-lg rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Welcome to Athena
        </h2>
        <p className="mb-6 text-gray-600">Please sign in to use Athena AI.</p>
        <button
          onClick={signIn}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Sign In
        </button>
      </div>
    </div>
  );
};
