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
        <div>
            <h1>{postData.title}</h1>
            <p>{postData.date}</p>
            <div dangerouslySetInnerHTML={{ __html: postData.contentHtml || '' }} />
        </div>
    );
}