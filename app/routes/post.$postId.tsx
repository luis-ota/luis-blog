import { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getPostById } from "~/utils/posts";
import { marked } from "marked";

export const loader: LoaderFunction = async ({ params }) => {
  const post = await getPostById(params.postId!);
  if (!post) throw new Response("Not Found", { status: 404 });

  const html =  marked(post.content);
  
  return Response.json({ ...post, html });
};

export default function Post() {
  const { html, id, createdAt } = useLoaderData<typeof loader>();

  return (
    <main className="max-w-3xl mx-auto p-6">
  <div className="mb-6 text-center">
    <h1 className="text-4xl font-bold mb-2 capitalize">{id.replace(/-/g, " ")}</h1>
    <p className="text-gray-500 dark:text-gray-400 text-sm">
      Published on {new Date(createdAt).toLocaleDateString("pt-BR")}
    </p>
  </div>

  <article
    className="prose 
      dark:prose-invert 
      prose-headings:font-semibold
      prose-a:text-blue-600
      hover:prose-a:text-blue-500
      prose-code:before:content-none
      prose-code:after:content-none
      max-w-none"
    dangerouslySetInnerHTML={{ __html: html }}
  />
</main>
  );
}
