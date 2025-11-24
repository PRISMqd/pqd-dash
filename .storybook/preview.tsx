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

const disableDarkReader = () => {
  if (typeof document === "undefined") return;

  const html = document.documentElement;
  html.setAttribute("data-darkreader-skip", "true");
  html.style.filter = "none";

  const ensureMeta = () => {
    if (document.querySelector('meta[name="darkreader"]')) return;
    const meta = document.createElement("meta");
    meta.name = "darkreader";
    meta.content = "disable";
    document.head.appendChild(meta);
  };

  const purgeDarkReaderArtifacts = () => {
    const selectors = [
      'style[class^="darkreader"]',
      'style[data-darkreader-inline]',
      'link[class^="darkreader"]',
    ];
    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((node) => {
        node.parentNode?.removeChild(node);
      });
    });

    ["data-darkreader-mode", "data-darkreader-scheme"].forEach((attr) => {
      if (html.hasAttribute(attr)) {
        html.removeAttribute(attr);
      }
    });
  };

  ensureMeta();
  purgeDarkReaderArtifacts();
};

const withFonts: Decorator = (Story) => {
  if (typeof document !== "undefined") {
    disableDarkReader();
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
    backgrounds: {
      default: "dashboard",
      values: [
        { name: "dashboard", value: "rgb(175, 212, 207)" },
        { name: "dark", value: "#0f111a" },
        { name: "white", value: "#ffffff" },
      ],
    },
  },
  tags: ["autodocs"],
  decorators: [withFonts],
};

export default preview;
