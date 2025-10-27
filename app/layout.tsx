"use client";

import { useEffect } from "react";
//import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/redux/provider";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "@ant-design/v5-patch-for-react-19";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useRouter } from "next/navigation";

import Cookies from "js-cookie";

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
  const router = useRouter();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "TOKEN_EXPIRED") {
        Cookies.remove("optisage-token");
        router.push("/login");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [router]);

  return (
    <html lang="en" data-theme="light">
      <body className={`${inter.className} antialiased`}>
        <AntdRegistry>
          <GoogleOAuthProvider
            clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}
          >
            <ReduxProvider>{children}</ReduxProvider>
          </GoogleOAuthProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}

