import { formatarData, getSortedPostsData } from "@/lib/posts";
import Link from "next/link";
import Image from "next/image";
import { Post } from "@/types/post";
import { Faiscas, type Cintila } from "@/app/components/enfeites";

const faiscasHero: Cintila[] = [
  { x: 7.5, y: 24.5, t: 13, atraso: 1.12, dur: 3.42, tipo: "faisca" },
  { x: 15.2, y: 72.5, t: 9, atraso: 2.64, dur: 4.02, tipo: "ponto" },
  { x: 26.4, y: 15.5, t: 11, atraso: 0.45, dur: 3.31, tipo: "estrela" },
  { x: 74.5, y: 22.5, t: 16, atraso: 3.28, dur: 3.77, tipo: "faisca" },
  { x: 88.6, y: 62.4, t: 9, atraso: 1.83, dur: 4.18, tipo: "losango" },
];

const faiscasArquivo: Cintila[] = [
  { x: 6.2, y: 4.5, t: 11, atraso: 0.72, dur: 3.54, tipo: "faisca" },
  { x: 92.4, y: 11.5, t: 13, atraso: 2.11, dur: 3.86, tipo: "estrela" },
  { x: 5.5, y: 22.5, t: 16, atraso: 3.42, dur: 4.11, tipo: "quadradinho" },
  { x: 93.1, y: 33.5, t: 9, atraso: 1.35, dur: 3.23, tipo: "tracejar" },
  { x: 7.4, y: 45.5, t: 13, atraso: 0.48, dur: 3.68, tipo: "losango" },
  { x: 91.8, y: 56.5, t: 11, atraso: 2.73, dur: 4.24, tipo: "mais" },
  { x: 6.0, y: 67.5, t: 9, atraso: 1.94, dur: 3.36, tipo: "ponto" },
  { x: 90.5, y: 78.5, t: 16, atraso: 3.08, dur: 3.92, tipo: "faisca" },
  { x: 5.8, y: 89.5, t: 13, atraso: 0.31, dur: 4.08, tipo: "estrela" },
];

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
          width={190}
          height={158}
        />
        <Image
          className="fundo fundo-estrelas"
          src="/docs/pontos-estrelas.svg"
          alt=""
          aria-hidden
          width={160}
          height={130}
        />
        <Faiscas itens={faiscasHero} />
        <p className="rotulo">notas e relatos de campo</p>
        <h1 className="script">notas</h1>
        <p className="lead">
          sobre código, servidores, linux e o que mais der vontade de escrever.
        </p>
      </section>

      <section className="arquivo-secao">
        <Image
          className="fundo fundo-quadrado"
          src="/docs/pontos-quadrado-globo.svg"
          alt=""
          aria-hidden
          width={200}
          height={200}
        />
        <Image
          className="fundo fundo-losango"
          src="/docs/pontos-losango.svg"
          alt=""
          aria-hidden
          width={220}
          height={293}
        />
        <Image
          className="fundo fundo-estrelas"
          src="/docs/pontos-estrelas.svg"
          alt=""
          aria-hidden
          width={150}
          height={121}
        />
        <Image
          className="fundo fundo-onda"
          src="/docs/pontos-onda.svg"
          alt=""
          aria-hidden
          width={640}
          height={220}
        />
        <Image
          className="fundo fundo-rio"
          src="/docs/pontos-rio.svg"
          alt=""
          aria-hidden
          width={640}
          height={240}
        />
        <Faiscas itens={faiscasArquivo} />
        <div className="arquivo limite">
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
        </div>
      </section>
    </div>
  );
}
