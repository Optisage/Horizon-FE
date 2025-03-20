"use client";

//import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/redux/provider";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "@ant-design/v5-patch-for-react-19";

const inter = Inter({ subsets: ["latin"] });

/** 
 const metadata: Metadata = {
  title: {
    template: "%s | optisage",
    default: "Sign In",
  },
  description: "Please Sign in to continue to your account",
  keywords: ["optisage"],
};
*/

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <body className={`${inter.className} antialiased`}>
        <AntdRegistry>
          <ReduxProvider>{children}</ReduxProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
