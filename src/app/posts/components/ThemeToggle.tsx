import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ThemeToggleProps {
  theme: "light" | "dark";
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === "dark";
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onToggle}
      className={`w-full justify-start ${
        isDark 
          ? "text-gray-300 hover:bg-white/5 hover:text-white" 
          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {theme === "dark" ? (
        <>
          <Sun className="w-4 h-4 mr-2" />
          Light Mode
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 mr-2" />
          Dark Mode
        </>
      )}
    </Button>
  );
}
