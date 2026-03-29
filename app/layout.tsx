import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Vercel Daily News",
    template: "%s | Vercel Daily News",
  },
  description:
    "The latest news, tutorials, and insights for modern web developers.",
  openGraph: {
    title: "Vercel Daily News",
    description:
      "The latest news, tutorials, and insights for modern web developers.",
    siteName: "Vercel Daily News",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
