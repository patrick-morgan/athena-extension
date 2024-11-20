import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "firebase/auth";
import { LogOut, Settings, Info, HelpCircle } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

interface UserMenuProps {
  user: User;
  isSubscribed: boolean;
}

// Function to generate a color based on email
const generateColorFromEmail = (email: string): string => {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-orange-500",
    "bg-cyan-500",
  ];

  // Simple hash function
  const hash = email.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  return colors[Math.abs(hash) % colors.length];
};

// Function to get initials from email
const getInitials = (email: string): string => {
  // Get the part before @ symbol
  const name = email.split("@")[0];
  // If the name has dots or underscores, treat them as word separators
  const words = name.split(/[._-]/);

  if (words.length >= 2) {
    // Get first letter of first two words
    return (words[0][0] + words[1][0]).toUpperCase();
  } else {
    // If single word, get first two letters
    return name.slice(0, 2).toUpperCase();
  }
};

export const UserMenu: React.FC<UserMenuProps> = ({ user, isSubscribed }) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const avatarColor = generateColorFromEmail(user.email || "");
  const initials = getInitials(user.email || "");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarFallback className={`${avatarColor} text-white font-medium`}>
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.email}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {isSubscribed ? "Premium" : "Free"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/about")}>
          <Info className="mr-2 h-4 w-4" />
          <span>About</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/support")}>
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Support</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onClick={signOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
