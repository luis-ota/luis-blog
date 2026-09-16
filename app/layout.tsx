import type { Metadata } from "next";
import { Sora, Yellowtail, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

import Link from "next/link";
import { Simbolos } from "./components/enfeites";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const yellowtail = Yellowtail({
  variable: "--font-yellowtail",
  subsets: ["latin"],
  weight: "400",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "luis's blog",
  description: "luis's blog where you will find tech and other crazy posts",
  openGraph: {
    url: "https://blog.wired.rs/",
    type: "website",
    title: "luis's blog",
    description: "luis's blog where you will find tech and other crazy posts",
    images: [
      {
        url: "https://blog.wired.rs/docs/lain-room.jpg",
        width: 1860,
        height: 1036,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "blog.wired.rs",
    title: "luis's blog",
    description: "luis's blog where you will find tech and other crazy posts",
    images: ["https://blog.wired.rs/docs/lain-room.jpg"],
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
      className={`${sora.variable} ${yellowtail.variable} ${plexMono.variable}`}
    >
      <body className="antialiased">
        <Simbolos />
        <header className="cabeca">
          <div className="limite cabeca-linha">
            <Link className="marca" href="/">
              <span className="marca-selo" aria-hidden="true">
                l
              </span>
              luis&apos;s blog
            </Link>
            <nav className="nav" aria-label="links">
              <Link href="https://portfolio.wired.rs/" target="_blank">
                portfolio ↗
              </Link>
              <Link href="https://github.com/luis-ota/luis-blog" target="_blank">
                github ↗
              </Link>
              <Link
                href="https://www.linkedin.com/in/luis-ota/"
                target="_blank"
              >
                linkedin ↗
              </Link>
              <Link href="https://www.twitch.tv/luisofthewired" target="_blank">
                twitch ↗
              </Link>
            </nav>
          </div>
        </header>
        {children}
        <footer className="rodape">
          <div className="limite rodape-linha">
            <p className="rodape-marca">
              <span className="marca-selo" aria-hidden="true">
                l
              </span>
              luis&apos;s blog
            </p>
            <p>
              © <span id="ano">{new Date().getFullYear()}</span>{" "}
              <Link
                className="link-marca"
                href="https://wired.rs/"
                target="_blank"
              >
                wired layer co.
              </Link>
            </p>
            <Link className="link-marca" href="https://portfolio.wired.rs/" target="_blank">
              portfolio ↗
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
