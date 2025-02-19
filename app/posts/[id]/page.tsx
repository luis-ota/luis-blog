import {getPostData, getSortedPostsData} from '@/lib/posts';

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

    return (
        <main className="max-w-3xl mx-auto p-6">
            <div className="mb-6 text-center">
                <h1 className="text-4xl font-bold mb-2 capitalize">{postData.title}</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                Published on {new Date(postData.date).toLocaleDateString("pt-BR")}
                </p>
            </div>

            <article
                className="markdown-body p-8"
                dangerouslySetInnerHTML={{ __html: postData.contentHtml || "" }}
            />
        </main>
    );
}