import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import {remark} from 'remark';
import remarkGfm from 'remark-gfm';
import html from 'remark-html';
import fse from 'fs-extra';
import {Post} from '@/types/post';
import { visit } from 'unist-util-visit';
import type { Image, Root } from 'mdast';

const postsDirectory = path.join(process.cwd(), 'posts');

// Get sorted posts data
export function getSortedPostsData(): Post[] {
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
        } as Post;
    }).filter(Boolean) as Post[];

    return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

function remarkImagePathTransformer(postId: string) {
    return () => (tree: Root) => {
      // Cast tree to the expected unist.Node type
      visit(tree as unknown as import('unist').Node, 'image', (node: Image) => {
        if (node.url && !node.url.startsWith('http') && !node.url.startsWith('/')) {
          node.url = `/luis-blog/images/${postId}/${node.url}`;
        }
      });
    };
  }

// Get post data by ID
export async function getPostData(id: string): Promise<Post> {
  const folderPath = path.join(postsDirectory, id);
  const markdownFile = fs
    .readdirSync(folderPath)
    .find((file) => file.endsWith('.md'));

  if (!markdownFile) throw new Error(`Markdown file not found for post: ${id}`);

  const fullPath = path.join(folderPath, markdownFile);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  const processedContent = await remark()
    .use(remarkGfm) // Enables tables, strikethrough, etc.
    .use(remarkImagePathTransformer(id))
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  return {
    id,
    contentHtml,
    ...matterResult.data,
  } as Post;
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