import { ColorMode } from "@aws-amplify/ui-react";
import { create } from "zustand";

type ThemeStore = {
  colorMode: ColorMode;
  onLightMode: () => void;
  onDarkMode: () => void;
  onSystemMode: () => void;
};

export const useThemeStore = create<ThemeStore>((set) => ({
  colorMode: "light",
  onLightMode: () => set({ colorMode: "light" }),
  onDarkMode: () => set({ colorMode: "dark" }),
  onSystemMode: () => set({ colorMode: "system" }),
}));
