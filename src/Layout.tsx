import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { UserMenu } from "./components/UserMenu";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, isSubscribed, signIn } = useAuth();

  return (
    <div className="flex flex-col h-[600px] w-[500px]">
      {" "}
      {/* Adjust height and width as needed */}
      <header className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <h1 className="text-black text-2xl">Athena</h1>
          <h3 className="text-primary text-sm mt-1.5">Find the truth</h3>
        </div>
        <div>
          {user ? (
            <UserMenu user={user} isSubscribed={isSubscribed} />
          ) : (
            <Button onClick={signIn} variant="outline" size="sm">
              Sign In
            </Button>
          )}
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
};
