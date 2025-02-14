import { getAllPosts } from "~/utils/posts";

export const loader = async ({ request }: { request: Request }) => {
  // Extract the query parameter from the URL, defaulting to an empty string
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.toLowerCase() || "";

  // Load all posts (each post has an id, title, description, and content)
  const posts = await getAllPosts();

  // If there's no query, return all posts. Otherwise, filter.
  const filteredPosts = q
    ? posts
        .filter((post): post is Post => post !== null)
        .filter((post: Post) => {
          return (
            post.id.toLowerCase().includes(q) ||
          post.description.toLowerCase().includes(q) ||
          post.content.toLowerCase().includes(q)
        );
      })
    : posts;

  return Response.json(filteredPosts);
};
