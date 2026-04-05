import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Header } from "./components/header";
import { Footer } from "./components/footer";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vercel-daily-news-ten.vercel.app"),
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
      className={`${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
