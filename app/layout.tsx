import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Link from "next/link";
import { Linkedin, Github, Podcast, Twitch} from 'lucide-react';
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "luis's blog",
  description: "luis's blog where you will find tech and other crazy posts",
  openGraph: {
    url: "https://luis-ota.github.io/luis-blog/",
    type: "website",
    title: "luis's blog",
    description: "luis's blog where you will find tech and other crazy posts",
    images: [
      {
        url: "https://luis-ota.github.io/luis-blog/docs/lain-room.jpg",
        width: 1860,
        height: 1036,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "luis-ota.github.io/luis-blog/", // corresponds to twitter:domain
    title: "luis's blog",
    description: "luis's blog where you will find tech and other crazy posts",
    images: ["https://luis-ota.github.io/luis-blog/docs/lain-room.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased backgroundImage`}
      >
      <header className="flex justify-between items-center p-4 bg-blue-400 dark:bg-gray-800">
        <Link href="/">
          <h1 className="text-1xl font-bold text-black dark:text-white md:text-3xl">
            {"luis's personal blog"}
          </h1>
      </Link>
        <nav className="flex justify-between items-center p-4 gap-4">
            <Link href="https://github.com/luis-ota/luis-blog" className="text-xl font-bold"><Github /></Link>
            <Link href="https://www.linkedin.com/in/luis-ota/" className="text-xl font-bold"><Linkedin /></Link>
            <Link href="https://www.twitch.tv/luisofthewired" className="text-xl font-bold"><Twitch /></Link>
            <Link href="https://open.spotify.com/show/6n18XZFHfd6p1PUcT8VhUC?si=wZueocvvRmqp0gNoZe-t7A" className="text-xl font-bold"><Podcast /></Link>
        </nav>
    </header>
        {children}
      </body>
    </html>
  );
}
