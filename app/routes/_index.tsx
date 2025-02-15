import { useLoaderData, Link, useFetcher, useNavigate } from "@remix-run/react";
import { LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useEffect, useState } from "react";
import { getAllPosts, searchPost } from "~/utils/posts";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const loader: LoaderFunction = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  const page = Number(url.searchParams.get("page")) || 1;
  const limit = Number(url.searchParams.get("limit")) || 5;

  // console.log("Pagination - page:", page, "limit:", limit);

  const { posts, total } = query ? await searchPost(query) : await getAllPosts(false, page, limit);

  return Response.json({ posts, total, page, limit });
};


export default function Index() {
  const { posts, total, page, limit } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setQuery(searchParams.get("q") || "");
  }, []);

  useEffect(() => {
    navigate(`/?q=${query}&page=1`);
  }, [query, navigate]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col p-6 gap-4">
      <div className="flex justify-between flex-wrap mx-10 flex-col md:flex-row">
        <h1 className="text-3xl font-bold mb-4">Blog Posts</h1>
        <input
          type="text"
          placeholder="Search posts..."
          className="p-2 border rounded mb-4"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>


      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate(`/?q=${query}&page=${page - 1}`)}
          disabled={page <= 1}
          className={`px-4 py-2 border rounded ${page <= 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"}`}
        >
         <ChevronLeft />
        </button>

        <span className="mx-4">
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() => navigate(`/?q=${query}&page=${page + 1}`)}
          disabled={page >= totalPages}
          className={`px-4 py-2 border rounded ${page >= totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"}`}
        >
         <ChevronRight />
         </button>
        </div>


      <div className="flex flex-col gap-4 items-center justify-center w-full">
        {posts.length > 0 ? (
          posts.map((post: Partial<Post>) => (
            <Link
              key={post.id}
              to={`/post/${post.id}`}
              className="flex flex-col p-4 border rounded-lg hover:bg-violet-400 w-full md:w-2/4 gap-4"
            >
                <div className="flex flex-col md:flex-row gap-4 items-center">
                {post.imgPath && (
                  <img
                  src={post.imgPath}
                  alt={post.description}
                  className="w-full md:w-36 h-24 object-cover rounded-lg"
                  />
                )}
                <div>
                  <h2 className="text-xl font-semibold">{post.id}</h2>
                  <p className="text-gray-600">{post.description}</p>
                </div>
              </div>
              <p>{post.createdAt ? new Date(post.createdAt).toLocaleDateString("pt-BR") : 'Date not available'}</p>
            </Link>
          ))
        ) : (
          <p>No posts found.</p>
        )}
      </div>

      
    </div>
  );
}


