import fs from "fs/promises";
import path from "path";
import { generateDescription } from "~/utils/generateDescription";

const POSTS_DIR = path.join(process.cwd(), "posts");

// console.log("POSTS_DIR", POSTS_DIR);

export const getAllPosts = async (
  generate_description?: boolean,
  page: number = 1,
  limit: number = 5
): Promise<{ posts: Partial<Post>[]; total: number }> => {
  const folders = await fs.readdir(POSTS_DIR);

  // Filter out hidden folders
  const validFolders = folders.filter((folder) => !folder.startsWith("."));

  // Fetch metadata (createdAt date) for sorting
  const foldersWithDates = await Promise.all(
    validFolders.map(async (folder) => {
      const postPath = path.join(POSTS_DIR, folder, "post.md");
      try {
        const stats = await fs.stat(postPath);
        return { folder, createdAt: stats.birthtime };
      } catch (error) {
        console.error(`Error reading metadata for ${folder}:`, error);
        return null;
      }
    })
  );

  // Remove null values and sort by createdAt (newest first)
  const sortedFolders = foldersWithDates
    .filter((item): item is { folder: string; createdAt: Date } => item !== null)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) // Sort descending

  // Pagination logic
  const total = sortedFolders.length;
  const start = (page - 1) * limit;
  const paginatedFolders = sortedFolders.slice(start, start + limit);

  const posts = await Promise.all(
    paginatedFolders.map(async ({ folder }) => {
      const postPath = path.join(POSTS_DIR, folder, "post.md");
      const imgPath = path.join(POSTS_DIR, folder, "img.png");
      const imgUrl = path.join(POSTS_DIR, folder, "img.url");

      let imgUrlValue: string | null = null;
      try {
        await fs.access(imgUrl);
        imgUrlValue = await fs.readFile(imgUrl, "utf-8");
      } catch (error) {
        imgUrlValue = null;
      }

      let imgPathValue: string | null = imgPath;
      try {
        await fs.access(imgPath);
      } catch (error) {
        imgPathValue = null;
      }

      try {
        const [content, stats] = await Promise.all([
          fs.readFile(postPath, "utf-8"),
          fs.stat(postPath),
        ]);

        const description = generate_description ? await generateDescription(content) : "Just another post";

        return {
          id: folder,
          description,
          content,
          createdAt: stats.birthtime,
          editedAt: stats.mtime,
          imgPath: imgPathValue || imgUrlValue,
        } as Partial<Post>;
      } catch (error) {
        console.error(`Error processing folder ${folder}:`, error);
        return null;
      }
    })
  );

  return { posts: posts.filter((post): post is Partial<Post> => post !== null), total };
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

export const searchPost = async (query: string, page: number = 1, limit: number = 5): Promise<{ posts: Partial<Post>[]; total: number }> => {
  const allPosts = await getAllPosts(false);
  const posts = allPosts.posts;

  // Apply search filter
  const filteredPosts = query
    ? posts.filter((post: Partial<Post>) => {
        return (
          post.id!.toLowerCase().includes(query.toLowerCase()) ||
          post.content!.toLowerCase().includes(query.toLowerCase())
        );
      })
    : posts;

  // Pagination logic
  const total = filteredPosts.length;
  const start = (page - 1) * limit;
  const paginatedPosts = filteredPosts.slice(start, start + limit);

  return { posts: paginatedPosts, total };
};
