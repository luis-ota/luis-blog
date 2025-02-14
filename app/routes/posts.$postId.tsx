import { useLoaderData } from '@remix-run/react';
import { marked } from 'marked'; 

export async function loader({ params }: { params: { postId: string } }) {
  const { postId } = params;

  const response = await fetch(
    `https://raw.githubusercontent.com/luis-ota/luis-blog/main/posts/${postId}.md`
  );
  const markdownContent = await response.text();

  const htmlContent = marked(markdownContent);

  return Response.json({ htmlContent });
}

export default function Post() {
  const { htmlContent } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden p-6">
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </div>
  );
}