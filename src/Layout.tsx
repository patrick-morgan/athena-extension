// components/Layout.tsx
import React, { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen">
      <header className="bg-blue-500 text-white p-4">
        <h1>Your Extension Header</h1>
      </header>
      <main className="flex-grow overflow-y-auto p-4 bg-gray-100">
        {children}
      </main>
    </div>
  );
};

export default Layout;
