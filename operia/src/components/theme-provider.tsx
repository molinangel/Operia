"use client";

import { ThemeProvider as NextThemes } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemes
      attribute="class"
      /*
        El sitio nace en oscuro, como la referencia. No es capricho: la vista
        del producto tiene mucha superficie y sobre fondo claro compite con el
        texto. El interruptor sigue estando para quien lo prefiera.
      */
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemes>
  );
}
