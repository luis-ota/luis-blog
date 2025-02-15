import { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getPostById } from "~/utils/posts";
import { marked } from "marked";

export const loader: LoaderFunction = async ({ params }) => {
  const post = await getPostById(params.postId!);
  if (!post) throw new Response("Not Found", { status: 404 });

  return Response.json({ ...post, html: marked(post.content) });
};

export default function Post() {
  const { html } = useLoaderData<typeof loader>();

  return (
    <article className="prose max-w-none p-6" dangerouslySetInnerHTML={{ __html: html }} />
  );
}
