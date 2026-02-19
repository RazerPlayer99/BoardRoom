import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BoardRoom — Multi-Agent Strategy Session",
  description: "A local-first multi-agent boardroom where you act as CEO",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
