import React, { ReactNode } from "react";
import logo from "./assets/owl-logo-png.png";
import { useAuth } from "./AuthContext";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, signIn, signOut } = useAuth();

  return (
    <div className="flex flex-col h-[800px] w-[500px] main-scrollable">
      <header className="p-4 border-b border-slate-200 flex items-center justify-between fixed top-0 left-0 right-0 bg-white z-10">
        <div className="flex items-center gap-2">
          <h1 className="text-black text-2xl">Athena</h1>
          <h3 className="text-primaryGreen text-sm mt-1.5">Find the truth</h3>
        </div>
        <div>
          {user ? (
            <button onClick={signOut} className="text-sm text-blue-600">
              Sign Out
            </button>
          ) : (
            <button onClick={signIn} className="text-sm text-blue-600">
              Sign In
            </button>
          )}
        </div>
      </header>
      <main className="flex-grow overflow-y-auto pt-16 px-6 mb-4 bg-white main-scrollable">
        {children}
      </main>
    </div>
  );
};
