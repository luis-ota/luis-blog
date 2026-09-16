import UtterancesComments from "@/app/components/utterances-comments";
import { formatarData, getPostData, getSortedPostsData } from "@/lib/posts";
import { Metadata } from "next";
import { Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import LanguageSwitcher from "@/app/components/lang-switch";
import { Faiscas, type Cintila } from "@/app/components/enfeites";

const faiscasPost: Cintila[] = [
  { x: 6.5, y: 18.5, t: 11, atraso: 0.94, dur: 3.62, tipo: "faisca" },
  { x: 93.2, y: 44.5, t: 9, atraso: 2.28, dur: 4.05, tipo: "ponto" },
  { x: 7.8, y: 66.5, t: 13, atraso: 3.51, dur: 3.44, tipo: "estrela" },
];

export const metadata: Metadata = {
  title: "luis's blog",
  description: "luis's blog where you will find tech and other crazy posts",
  openGraph: {
    url: "https://blog.wired.rs/",
    type: "website",
    title: "luis's blog",
    description: "luis's blog where you will find tech and other crazy posts",
    images: [
      {
        url: "https://blog.wired.rs/sonic.gif",
        width: 1860,
        height: 1036,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "blog.wired.rs",
    title: "luis's blog",
    description: "luis's blog where you will find tech and other crazy posts",
    images: ["https://blog.wired.rs/sonic.gif"],
  },
};

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
  metadata.title = postData.title;

  metadata.description = postData.description;
  if (metadata.openGraph) {
    metadata.openGraph.title = postData.title || "luis's blog";
    metadata.openGraph.description = postData.description;
    if (
      metadata.openGraph.images &&
      Array.isArray(metadata.openGraph.images) &&
      metadata.openGraph.images.length > 0
    ) {
      const firstImage = metadata.openGraph.images[0];
      if (typeof firstImage === "object" && "url" in firstImage) {
        firstImage.url = postData.img?.startsWith("http")
          ? postData.img
          : `https://blog.wired.rs${postData.img}` || "";
        firstImage.width = 1200;
        firstImage.height = 630;
      }
    }
  }
  metadata.twitter!.title = postData.title;
  metadata.twitter!.description = postData.description;
  if (
    metadata.twitter &&
    metadata.twitter.images &&
    Array.isArray(metadata.twitter.images)
  ) {
    metadata.twitter.images[0] = postData.img?.startsWith("http")
      ? postData.img
      : `https://blog.wired.rs${postData.img}` || "";
  }

  const postCanonicalUrlWired = `https://blog.wired.rs/posts/${postData.id}`;
  const encodedUrlWired = encodeURIComponent(postCanonicalUrlWired);
  const hitsBadgeUrl = `https://hitscounter.dev/api/hit?url=${encodedUrlWired}&color=%232a2a8c`;

  return (
    <main className="post-pagina">
      <Image
        className="fundo fundo-abstrato"
        src="/docs/dados-abstrato.svg"
        alt=""
        aria-hidden
        width={1200}
        height={630}
      />
      <Image
        className="fundo fundo-estrelas"
        src="/docs/pontos-estrelas.svg"
        alt=""
        aria-hidden
        width={170}
        height={138}
      />
      <Image
        className="fundo fundo-losango fundo-meio"
        src="/docs/pontos-losango.svg"
        alt=""
        aria-hidden
        width={200}
        height={266}
      />
      <Image
        className="fundo fundo-rio"
        src="/docs/pontos-rio.svg"
        alt=""
        aria-hidden
        width={640}
        height={240}
      />
      <Image
        className="fundo fundo-quadrado"
        src="/docs/pontos-quadrado-globo.svg"
        alt=""
        aria-hidden
        width={180}
        height={180}
      />
      <Faiscas itens={faiscasPost} />

      <div className="pagina-post limite">
      <div className="post-cabeca">
        <p className="post-data">publicado em {formatarData(postData.date)}</p>
        <h1 className="post-titulo-grande">{postData.title}</h1>
        <div className="post-metricas">
          <Eye size={16} aria-hidden />
          <Image src={hitsBadgeUrl} alt="visualizações" width={90} height={20} />
        </div>
      </div>

      <LanguageSwitcher encodedUrl={encodedUrlWired} />

      <article
        className="markdown-body artigo"
        dangerouslySetInnerHTML={{ __html: postData.contentHtml || "" }}
      />

      <div className="comentarios">
        <UtterancesComments
          repo="luis-ota/luis-blog"
          issueTerm="pathname"
          theme="preferred-color-scheme"
        />
      </div>

      <p style={{ textAlign: "center", marginTop: "26px" }}>
        <Link className="link-marca" href="/">
          ← voltar para o arquivo
        </Link>
      </p>
      </div>
    </main>
  );
}
