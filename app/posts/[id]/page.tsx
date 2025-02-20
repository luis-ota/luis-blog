import {getPostData, getSortedPostsData} from '@/lib/posts';
import { Metadata } from 'next';
 

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
    site: "luis-ota.github.io/luis-blog/", // corresponds to twitter:domain
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
        if (metadata.openGraph.images && Array.isArray(metadata.openGraph.images) && metadata.openGraph.images.length > 0) {
            const firstImage = metadata.openGraph.images[0];
            if (typeof firstImage === 'object' && 'url' in firstImage) {
                firstImage.url = postData.img?.startsWith("http") ? postData.img : `https://luis-ota.github.io/${postData.img}` || "";
            }
        }
    }
    metadata.twitter!.title = postData.title;
    metadata.twitter!.description = postData.description;
    if (metadata.twitter && metadata.twitter.images && Array.isArray(metadata.twitter.images)) {
        metadata.twitter.images[0] = postData.img?.startsWith("http") ? postData.img : `https://luis-ota.github.io/${postData.img}` || "";
    }

    return (
        <main className="max-w-3xl mx-auto p-6">
            <div className="mb-6 p-4 text-center rounded bg-gray-800">
                <h1 className="text-4xl font-bold mb-2 capitalize">{postData.title}</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                Published on {new Date(postData.date).toLocaleDateString("pt-BR")}
                </p>
            </div>

            <article
                className="markdown-body p-6 rounded bg-gray-800"
                dangerouslySetInnerHTML={{ __html: postData.contentHtml || "" }}
            />
        </main>
    );
}