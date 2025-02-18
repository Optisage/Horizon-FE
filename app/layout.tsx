import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/redux/provider";
import '@ant-design/v5-patch-for-react-19';

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
      
      <body className={`${inter.className} antialiased`}>
      <ReduxProvider>
        {children}
        </ReduxProvider>
        </body>
     
    </html>
  );
}

