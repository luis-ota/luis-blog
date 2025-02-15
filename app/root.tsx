import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";

import "./tailwind.css";
import Header from "./componets/header";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* HTML Meta Tags  */}
        <title>luis's blog</title>
        <meta name="description" content="luis's blog where you will find tech and other crazy posts" />

         {/* Open Graph Meta Tags  */}
        <meta property="og:url" content="https://luis-blog-c93208b2f883.herokuapp.com" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="luis's blog" />
        <meta property="og:description" content="luis's blog where you will find tech and other crazy posts" />
        <meta property="og:image" content="https://luis-blog-c93208b2f883.herokuapp.com/preview.png" />
        <meta property="og:image:width" content="1860" />
        <meta property="og:image:height" content="1036" />

        {/* Twitter Meta Tags  */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="luis-blog-c93208b2f883.herokuapp.com" />
        <meta property="twitter:url" content="https://luis-blog-c93208b2f883.herokuapp.com" />
        <meta name="twitter:title" content="luis's blog" />
        <meta name="twitter:description" content="luis's blog where you will find tech and other crazy posts" />
        <meta name="twitter:image" content="https://luis-blog-c93208b2f883.herokuapp.com/preview.png" />

        
        <Meta />
        <Links />
      </head>
      <body>
        <Header/>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
