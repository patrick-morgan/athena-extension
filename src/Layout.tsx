import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { UserMenu } from "./components/UserMenu";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, isSubscribed, signIn, isLoading } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full min-h-[500px] w-[500px] bg-background">
      <header className="w-full px-6 p-4 bg-primary text-primary-foreground border-b border-accent/10 flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <h1 className="text-2xl font-bold">Athena</h1>
          <h3 className="text-secondary-foreground mt-1 font-medium">
            Find the truth
          </h3>
        </div>
        <div>
          {isLoading ? null : (
            <>
              {user ? (
                <UserMenu user={user} isSubscribed={isSubscribed} />
              ) : (
                <Button onClick={signIn} variant="secondary" size="sm">
                  Sign In
                </Button>
              )}
            </>
          )}
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
};
