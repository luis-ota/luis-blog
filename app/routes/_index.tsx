import { useLoaderData, Link, useFetcher } from "@remix-run/react";
import { LoaderFunction } from "@remix-run/node";
import { useState } from "react";
import { getAllPosts } from "~/utils/posts";

export const loader: LoaderFunction = async () => {
  // Initially load all posts
  const posts = await getAllPosts();
  return Response.json(posts);
};

export default function Index() {
  const initialPosts = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [query, setQuery] = useState("");

  // Use fetched data if available, otherwise fallback to initial posts
  const posts = fetcher.data || initialPosts;

  return (
    <div className="p-6">
      <div className="flex justify-between  items-center mx-10">
        <h1 className="text-3xl font-bold mb-4">Blog Posts</h1>
        <input
          type="text"
          placeholder="Search posts..."
          className="w-1/4 p-2 border rounded mb-4"
          value={query}
          onChange={(e) => {
            const newQuery = e.target.value;
            setQuery(newQuery);
            // Trigger the search API endpoint with the query
            fetcher.load(`/api/search?q=${encodeURIComponent(newQuery)}`);
          }}
        />
      </div>

      <div className="flex flex-col gap-4 items-center justify-center w-full">
        {posts.length > 0 ? (
          posts.map((post: Post) => (
            <Link
              key={post.id}
              to={`/post/${post.id}`}
              className="block p-4 border rounded-lg hover:bg-gray-100 w-1/4"
            >
              {post.imgPath && <img
                src={post.imgPath}
                alt={post.description}
                className="w-full h-40 object-cover rounded-lg"
              />}
              <div>
                <h2 className="text-xl font-semibold">{post.id}</h2>
                <p className="text-gray-600">{post.description}</p>
              </div>
            </Link>
          ))
        ) : (
          <p>No posts found.</p>
        )}
      </div>
    </div>
  );
}
