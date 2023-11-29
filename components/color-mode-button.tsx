import { MdDarkMode, MdLightMode } from "react-icons/md";

import { useThemeStore } from "@/hooks/theme-mode-store";
import { cn } from "@/utils/cn";

export const ColorModeButton = () => {
  const { colorMode, onLightMode, onDarkMode } = useThemeStore();

  return (
    <div className="h-8 border-b overflow-hidden flex">
      <button
        className={cn(
          "w-full border-r p-1.5 hover:opacity-75 flex items-center justify-center",
          colorMode === "light" && "text-yellow-500 bg-yellow-50",
          colorMode === "dark" && "text-white"
        )}
        onClick={onLightMode}
      >
        <MdLightMode className="h-5 w-5" />
      </button>
      <button
        className={cn(
          "w-full p-1.5 hover:opacity-75 flex items-center justify-center",
          colorMode === "dark" && "text-purple-500 bg-purple-50"
        )}
        onClick={onDarkMode}
      >
        <MdDarkMode className="h-5 w-5" />
      </button>
    </div>
  );
};
