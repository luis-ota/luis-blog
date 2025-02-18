// lib/posts.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import {remark} from 'remark';
import html from 'remark-html';
import fse from 'fs-extra';

const postsDirectory = path.join(process.cwd(), 'posts');

// Get sorted posts data
export function getSortedPostsData(): { id: string; title: string; date: string, img: string }[] {
    const postFolders = fs.readdirSync(postsDirectory);

    const allPostsData = postFolders.map((folder) => {
        const folderPath = path.join(postsDirectory, folder);
        const markdownFile = fs
            .readdirSync(folderPath)
            .find((file) => file.endsWith('.md'));

        if (!markdownFile) return null;

        const fullPath = path.join(folderPath, markdownFile);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const matterResult = matter(fileContents);
        // console.log(matterResult.data)
        return {
            id: folder,
            ...matterResult.data,
        } as { id: string; title: string; date: string, img: string };
    }).filter(Boolean) as { id: string; title: string; date: string, img:string }[];

    return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

// Get post data by ID
export async function getPostData(id: string): Promise<{ id: string; contentHtml: string; title: string; date: string }> {
    const folderPath = path.join(postsDirectory, id);
    const markdownFile = fs
        .readdirSync(folderPath)
        .find((file) => file.endsWith('.md'));

    if (!markdownFile) throw new Error(`Markdown file not found for post: ${id}`);

    const fullPath = path.join(folderPath, markdownFile);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    const processedContent = await remark()
        .use(html)
        .process(matterResult.content);
    const contentHtml = processedContent.toString();

    return {
        id,
        contentHtml,
        ...matterResult.data,
    } as { id: string; contentHtml: string; title: string; date: string };
}

// Copy images to the public directory
export function copyImagesToPublic(): void {
    const publicDir = path.join(process.cwd(), 'public', 'images');
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    const postFolders = fs.readdirSync(postsDirectory);

    postFolders.forEach((folder) => {
        const folderPath = path.join(postsDirectory, folder);
        const files = fs.readdirSync(folderPath);

        files.forEach((file) => {
            if (!file.endsWith('.md')) {
                const sourcePath = path.join(folderPath, file);
                const targetPath = path.join(publicDir, folder, file);

                // Ensure the subfolder exists
                fse.mkdirpSync(path.dirname(targetPath));

                // Copy the file
                fse.copyFileSync(sourcePath, targetPath);
            }
        });
    });
}