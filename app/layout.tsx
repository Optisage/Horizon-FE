import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/redux/provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | Optisage",
    default: "Sign In",
  },
  description: "Please Sign in to continue to your account",
  keywords: ["Optisage"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <ReduxProvider>
      <body className={`${inter.className} antialiased`}>{children}</body>
      </ReduxProvider>
    </html>
  );
}

