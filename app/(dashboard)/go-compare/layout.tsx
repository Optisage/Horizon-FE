import { Metadata } from "next";
import Navigation from "./_components/Navigation";

export const metadata: Metadata = {
  title: "Go Compare",
  description: "Go Compare",
};

export default function GoCompareLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className="flex flex-col gap-5">
            <Navigation />
            {children}
        </main>
    );
}
