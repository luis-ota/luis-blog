// app/page.tsx
import { getSortedPostsData } from '@/lib/posts';
import Link from "next/link";
import Image from "next/image";

export default async function Home() {
  const allPostsData = await getSortedPostsData();
  return (
          <div className="flex w-full items-center justify-center p-6">
              {allPostsData.map(({ id, title, date, img }) => (
                  <Link href={`posts/${id}`} key={id} className="flex flex-col justify-between p-6 bg-violet-400 w-1/4 rounded">
                      <div className="flex flex-row">
                          <Image src={img} alt={title} width={10} height={5}/>
                          <div>
                              <h2>{title}</h2>
                          </div>
                      </div>
                      <p>{date}</p>

                  </Link>

              ))}
          </div>
  );
}