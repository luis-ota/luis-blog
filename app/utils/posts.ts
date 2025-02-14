import fs from "fs/promises";
import path from "path";
import { generateDescription } from "~/utils/generateDescription";

const POSTS_DIR = path.join(process.cwd(), "posts");

// console.log("POSTS_DIR", POSTS_DIR);

export const getAllPosts = async (): Promise<Partial<Post>[]> => {
  const folders = await fs.readdir(POSTS_DIR);

  const posts = await Promise.all(
    folders.map(async (folder) => {
      if (folder.startsWith(".")) {
        return null;
      }
      const postPath = path.join(POSTS_DIR, folder, "post.md");
      const imgPath = path.join(POSTS_DIR, folder, "img.png");
      try {
        // Read the content and file stats concurrently.
        const [content, stats] = await Promise.all([
          fs.readFile(postPath, "utf-8"),
          fs.stat(postPath),
        ]);

        const description = await generateDescription(content);

        let imgPathValue: string | null = imgPath;
        try {
          await fs.access(imgPath);
        } catch (error) {
          imgPathValue = null;
        }

        return {
          id: folder,
          description,
          createdAt: stats.birthtime,
          editedAt: stats.mtime,
          imgPath: imgPathValue,
        } as Partial<Post>;
      } catch (error) {
        console.error(`Error processing folder ${folder}:`, error);
        return null;
      }
    })
  );

  // Filter out any null posts
  return posts.filter((post): post is Partial<Post> => post !== null);
};

export const getPostById = async (postId: string): Promise<Post | null> => {
  const postPath = path.join(POSTS_DIR, postId, "post.md");
  try {
    const [content, stats] = await Promise.all([
      fs.readFile(postPath, "utf-8"),
      fs.stat(postPath),
    ]);

    return {
      id: postId,
      content,
      createdAt: stats.birthtime,
      editedAt: stats.mtime,
    } as Post;
  } catch (error) {
    console.error(`Error reading post ${postId}:`, error);
    return null;
  }
};
