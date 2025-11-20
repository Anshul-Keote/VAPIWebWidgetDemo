import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Courtney - AI Customer Support",
  description: "AI-powered customer support for Courtsapp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
