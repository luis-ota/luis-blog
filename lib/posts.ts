import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype'; 
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import fse from 'fs-extra';
import { Post } from '@/types/post';
import { visit } from 'unist-util-visit';
import type { Image, Root } from 'mdast';


const postsDirectory = path.join(process.cwd(), 'posts');

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
      visit(tree as unknown as import('unist').Node, 'image', (node: Image) => {
        if (node.url && !node.url.startsWith('http') && !node.url.startsWith('/')) {
          node.url = `/luis-blog/images/${postId}/${node.url}`; 
        }
      });
    };
  }

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
    .use(remarkGfm)
    .use(remarkImagePathTransformer(id))
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw) 
    .use(rehypeStringify) 
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  return {
    id,
    contentHtml,
    ...matterResult.data,
  } as Post;
}

export function copyImagesToPublic(): void {
    const basePublicDir = path.join(process.cwd(), 'public');
    const publicImagesDir = path.join(basePublicDir, 'luis-blog', 'images'); 
    fse.mkdirpSync(publicImagesDir);


    const postFolders = fs.readdirSync(postsDirectory);

    postFolders.forEach((folder) => {
        const sourceFolderPath = path.join(postsDirectory, folder);
        const targetFolderPath = path.join(publicImagesDir, folder); 

        const files = fs.readdirSync(sourceFolderPath);

        files.forEach((file) => {
            if (!file.endsWith('.md')) {
                const sourcePath = path.join(sourceFolderPath, file);
                const targetPath = path.join(targetFolderPath, file);

                fse.mkdirpSync(targetFolderPath);

                try {
                    fse.copyFileSync(sourcePath, targetPath);
                } catch (err) {
                    console.error(`Error copying ${sourcePath} to ${targetPath}:`, err);
                }
            }
        });
    });
}