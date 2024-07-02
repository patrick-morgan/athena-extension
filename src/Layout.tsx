import React, { ReactNode } from "react";
import logo from "./assets/owl-logo-png.png";

interface LayoutProps {
  children: ReactNode;
}

// export const Layout = ({ children }: LayoutProps) => {
//   return (
//     <div className="flex flex-col h-[800px] w-[500px]">
//       <header className="p-4 border-b border-slate-200 flex items-center justify-between">
//         <div className="flex items-center gap-2">
//           <h1 className="text-black text-2xl">Athena</h1>
//           <h3 className="text-primaryGreen text-sm mt-1.5">Find the truth</h3>
//         </div>
//         <div>
//           {/** Extension logo */}
//           <img src={logo} alt="Owl Logo" className="text-sm w-9 h-9" />
//         </div>
//       </header>
//       {/** removed these while testing: flex-grow overflow-y-auto */}
//       <main className="h-full px-6 mb-4 bg-white">{children}</main>
//     </div>
//   );
// };

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col h-[800px] w-[500px] main-scrollable">
      <header className="p-4 border-b border-slate-200 flex items-center justify-between fixed top-0 left-0 right-0 bg-white z-10">
        <div className="flex items-center gap-2">
          <h1 className="text-black text-2xl">Athena</h1>
          <h3 className="text-primaryGreen text-sm mt-1.5">Find the truth</h3>
        </div>
        <div>
          {/** Extension logo */}
          <img src={logo} alt="Owl Logo" className="text-sm w-9 h-9" />
        </div>
      </header>
      <main className="flex-grow overflow-y-auto pt-16 px-6 mb-4 bg-white main-scrollable">
        {children}
      </main>
    </div>
  );
};
