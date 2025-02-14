import { useLoaderData } from '@remix-run/react';

export async function loader() {
  const response = await fetch(
    'https://api.github.com/repos/luis-ota/luis-blog/contents/posts'
  );
  const data = await response.json();

  const markdownFiles = data.filter((file: any) => file.name.endsWith('.md'));

  return Response.json({ markdownFiles });
}

export default function Index() {
  const { markdownFiles } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
          My Blog
        </h1>
        <div className="space-y-6">
          {markdownFiles.map((file: any) => (
            <div
              key={file.name}
              className="bg-white shadow-lg rounded-lg overflow-hidden p-6"
            >
              <h2 className="text-2xl font-semibold text-gray-800">
                {file.name.replace('.md', '')}
              </h2>
              <a
                href={`/posts/${file.name.replace('.md', '')}`}
                className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium"
              >
                Read More →
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}