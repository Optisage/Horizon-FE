import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const sf_pro_display = localFont({
  src: [
    {
      path: "../fonts/SFPRODISPLAYREGULAR.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/SFPRODISPLAYSEMIBOLDITALIC.otf",
      weight: "600",
      style: "italic",
    },
    {
      path: "../fonts/SFPRODISPLAYBOLD.otf",
      weight: "700",
      style: "normal",
    },
  ],
});

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
      <body className={`${sf_pro_display.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}

