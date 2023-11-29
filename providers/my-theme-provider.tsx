import React from "react";
import { useThemeStore } from "@/hooks/theme-mode-store";
import { myTheme } from "@/styles/theme";
import { ThemeProvider } from "@aws-amplify/ui-react";

import "@aws-amplify/ui-react/styles.css";

type Props = {
  children: JSX.Element | JSX.Element[];
};

export const MyThemeProvider: React.FC<Props> = ({ children }) => {
  const { colorMode } = useThemeStore();

  return (
    <ThemeProvider theme={myTheme} colorMode={colorMode}>
      {children}
    </ThemeProvider>
  );
};
