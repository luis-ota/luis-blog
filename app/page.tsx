import { formatarData, getSortedPostsData } from "@/lib/posts";
import Link from "next/link";
import Image from "next/image";
import { Post } from "@/types/post";

export default async function Home() {
  const allPostsData = getSortedPostsData();
  return (
    <div className="pagina">
      <section className="cartaz">
        <Image
          className="fundo fundo-ascii"
          src="/docs/pontos-ascii.svg"
          alt=""
          aria-hidden
          width={330}
          height={300}
        />
        <Image
          className="fundo fundo-estrelas"
          src="/docs/pontos-estrelas.svg"
          alt=""
          aria-hidden
          width={280}
          height={230}
        />
        <p className="rotulo">notas e relatos de campo</p>
        <h1 className="script">notas</h1>
        <p className="lead">
          sobre código, servidores, linux e o que mais der vontade de escrever.
        </p>
      </section>

      <section className="arquivo limite">
        <p className="rotulo">arquivo</p>
        <div className="lista">
          {allPostsData.length > 0 ? (
            allPostsData.map(({ id, title, date, img, description }: Post) => (
              <Link key={id} href={`posts/${id}`} className="post-card">
                {img && (
                  <Image
                    className="post-img"
                    src={img}
                    alt={title}
                    width={132}
                    height={96}
                  />
                )}
                <div className="post-corpo">
                  <p className="post-data">{formatarData(date)}</p>
                  <h2 className="post-titulo">{title}</h2>
                  {description && <p className="post-desc">{description}</p>}
                </div>
              </Link>
            ))
          ) : (
            <p className="vazio">nenhum post ainda.</p>
          )}
        </div>
      </section>
    </div>
  );
}
