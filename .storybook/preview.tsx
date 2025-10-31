import type { Preview } from "@storybook/nextjs-vite";
import "../app/globals.css";
import type { Decorator } from "@storybook/react";
import { Exo_2, Rajdhani } from "next/font/google";

const exo2 = Exo_2({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-rajdhani",
});

const withFonts: Decorator = (Story) => {
  if (typeof document !== "undefined") {
    document.documentElement.classList.add(rajdhani.variable);
    document.body.classList.add(exo2.className, "antialiased");
  }

  return (
    <div className={`${exo2.className} ${rajdhani.variable}`}>
      <Story />
    </div>
  );
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  tags: ["autodocs"],
  decorators: [withFonts],
};

export default preview;
