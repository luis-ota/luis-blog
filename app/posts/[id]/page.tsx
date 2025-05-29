import UtterancesComments from "@/app/components/utterances-comments";
import { getPostData, getSortedPostsData } from "@/lib/posts";
import { Metadata } from "next";
import { Eye, Languages } from "lucide-react";

export const metadata: Metadata = {
  title: "luis's blog",
  description: "luis's blog where you will find tech and other crazy posts",
  openGraph: {
    url: "https://luis-ota.github.io/luis-blog/",
    type: "website",
    title: "luis's blog",
    description: "luis's blog where you will find tech and other crazy posts",
    images: [
      {
        url: "https://luis-ota.github.io/luis-blog/sonic.gif",
        width: 1860,
        height: 1036,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "luis-ota.github.io/luis-blog/",
    title: "luis's blog",
    description: "luis's blog where you will find tech and other crazy posts",
    images: ["https://luis-ota.github.io/luis-blog/sonic.gif"],
  },
};

export function generateStaticParams() {
  const posts = getSortedPostsData();
  return posts.map((post) => ({
    id: post.id,
  }));
}

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const postData = await getPostData(id);
  metadata.title = postData.title;

  metadata.description = postData.description;
  if (metadata.openGraph) {
    metadata.openGraph.title = postData.title || "luis's blog";
    metadata.openGraph.description = postData.description;
    if (
      metadata.openGraph.images &&
      Array.isArray(metadata.openGraph.images) &&
      metadata.openGraph.images.length > 0
    ) {
      const firstImage = metadata.openGraph.images[0];
      if (typeof firstImage === "object" && "url" in firstImage) {
        firstImage.url = postData.img?.startsWith("http")
          ? postData.img
          : `https://luis-ota.github.io${postData.img}` || "";
      }
    }
  }
  metadata.twitter!.title = postData.title;
  metadata.twitter!.description = postData.description;
  if (
    metadata.twitter &&
    metadata.twitter.images &&
    Array.isArray(metadata.twitter.images)
  ) {
    metadata.twitter.images[0] = postData.img?.startsWith("http")
      ? postData.img
      : `https://luis-ota.github.io${postData.img}` || "";
  }

  const postCanonicalUrl = `https://luis-ota.github.io/luis-blog/posts/${postData.id}`;
  const encodedUrl = encodeURIComponent(postCanonicalUrl);
  const hitsBadgeUrl = `https://hitscounter.dev/api/hit?url=${encodedUrl}&color=%23cfe2ff`;

  return (
    <main className="max-w-4xl mx-auto p-4 flex flex-col justify-center gap-4">
      <div className="markdown-body p-4 text-center rounded">
        <h1 className="text-4xl font-bold mb-2 capitalize">{postData.title}</h1>

        <div className="flex flex-col items-center ">
          <p className="text-sm">
            Published on {new Date(postData.date).toLocaleDateString("pt-BR")}
          </p>
          <div className="flex gap-2 items-center h-1">
            <Eye className="text-gray-500" />
            <img src={hitsBadgeUrl} alt="Post Views" />
          </div>
        </div>
      </div>
      <a
        href={`https://translate.google.com/website?sl=en&tl=pt&u=${encodeURIComponent(encodedUrl)}`}
        className="flex flex-row markdown-body w-40 gap-2 px-4 py-2 rounded transition"
      >
        <Languages />
        Traduzir
      </a>

      <article
        className="markdown-body p-6 rounded"
        dangerouslySetInnerHTML={{ __html: postData.contentHtml || "" }}
      />
      <div className="markdown-body p-6 rounded">
        <UtterancesComments
          repo="luis-ota/luis-blog"
          issueTerm="pathname"
          theme="preferred-color-scheme"
        />
      </div>
    </main>
  );
}
