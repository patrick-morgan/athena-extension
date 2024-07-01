// components/Layout.tsx
import React, { ReactNode } from "react";
// import logo from ""
// import logo from "owl-logo-png.png";
import logo from "./assets/owl-logo-png.png";
// import logo from "./assets/owl-logo-png.png";
// import logo from "./in"
// import "./assets/owl-logo-png.png";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-[800px] w-[500px]">
      <header className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-black text-2xl">Athena</h1>
          <h3 className="text-primaryGreen text-sm mt-1.5">Find the truth</h3>
        </div>
        <div>
          {/** Extension logo */}
          <img src={logo} alt="Owl Logo" className="text-sm w-9 h-9" />
        </div>
      </header>
      <main className="flex-grow overflow-y-auto p-4 bg-gray-100">
        {children}
      </main>
    </div>
  );
};

export default Layout;
