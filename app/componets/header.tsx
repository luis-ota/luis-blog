import { useLoaderData, Link, useFetcher } from "@remix-run/react";
import { LoaderFunction } from "@remix-run/node";
import { useState } from "react";
import { getAllPosts } from "~/utils/posts";
import { Github, Home, Linkedin } from "lucide-react";

export default function Header() {
  

  return (
    <header className="flex justify-between items-center p-4 bg-gray-800">
        <h1 className="text-3xl font-bold text-white">
        luis personal blog
        </h1>
        <nav className="flex justify-between items-center p-4 gap-4">
            <Link to="/" className="text-xl font-bold"><Home/></Link>
            <Link to="https://github.com/luis-ota/luis-blog" className="text-xl font-bold"><Github /></Link>
            <Link to="https://www.linkedin.com/in/luis-ota/" className="text-xl font-bold"><Linkedin /></Link>
        </nav>
    </header>
  );
}

