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
    <div className="flex flex-col h-[600px] w-[400px] bg-background">
      <header className="w-full p-4 bg-[hsl(var(--header-background))] border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-primary text-2xl font-bold">Athena</h1>
          <h3 className="text-accent text-sm">Find the truth</h3>
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
