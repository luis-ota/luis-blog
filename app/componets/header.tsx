import { useLoaderData, Link, useFetcher } from "@remix-run/react";
import { LoaderFunction } from "@remix-run/node";
import { useState } from "react";
import { getAllPosts } from "~/utils/posts";
import { Github } from "lucide-react";

export default function Header() {
  

  return (
    <header>
        luis personal blog
        <nav className="flex justify-between items-center p-4">
            <Link to="/" className="text-xl font-bold">Home</Link>
            <Link to="" className="text-xl font-bold"><Github /></Link>
        </nav>
    </header>
  );
}
