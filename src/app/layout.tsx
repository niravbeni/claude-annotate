import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

// Anthropic Sans - for UI elements
const anthropicSans = localFont({
  src: [
    {
      path: "../../public/fonts/AnthropicSans-Variable.ttf",
      weight: "400 600",
      style: "normal",
    },
  ],
  variable: "--font-sans",
});

// Anthropic Serif - for Claude responses and editor text
const anthropicSerif = localFont({
  src: [
    {
      path: "../../public/fonts/AnthropicSerif-Variable.ttf",
      weight: "400 650",
      style: "normal",
    },
  ],
  variable: "--font-serif",
});

// JetBrains Mono - for code
const jetbrainsMono = localFont({
  src: [
    {
      path: "../../public/fonts/JetBrainsMono-VariableFont_wght.ttf",
      weight: "400 700",
      style: "normal",
    },
    {
      path: "../../public/fonts/JetBrainsMono-Italic-VariableFont_wght.ttf",
      weight: "400 700",
      style: "italic",
    },
  ],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Claude",
  description: "Get AI-powered feedback on your writing with visual annotations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${anthropicSans.variable} ${anthropicSerif.variable} ${jetbrainsMono.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
