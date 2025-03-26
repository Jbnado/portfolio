import Image from "next/image";
import Link from "next/link";
import { getPost, getPosts } from "@/lib/blog";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ClientMarkdownRenderer from "@/components/ClientMarkdownRenderer";
import { MdArrowBack } from "react-icons/md";

interface BlogParams {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: BlogParams): Promise<Metadata> {
  const post = await getPost(params.slug);

  if (!post) {
    return {
      title: "Post não encontrado | Blog",
    };
  }

  return {
    title: `${post.title} | Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      images: [post.coverImage],
    },
  };
}

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPost({ params }: BlogParams) {
  const post = await getPost(params.slug);

  if (!post) {
    return (
      <>
        <Navbar />
        <div className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Post não encontrado</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              O artigo que você está procurando não existe ou foi removido.
            </p>
            <Link
              href="/blog"
              className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
            >
              Voltar para o blog
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="py-16 px-4">
        <article className="max-w-4xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center text-cyan-600 mb-6 hover:text-cyan-700 transition-colors"
          >
            <MdArrowBack className="w-4 h-4 mr-2" />
            Voltar para o blog
          </Link>

          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

          <div className="text-gray-500 dark:text-gray-400 mb-6">
            {new Date(post.date).toLocaleDateString("pt-BR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>

          <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.altImage}
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 md:p-8 shadow-sm">
            <ClientMarkdownRenderer content={post.content} />
          </div>

          <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Link
                href="/blog"
                className="inline-flex items-center text-cyan-600 hover:text-cyan-700 transition-colors"
              >
                <MdArrowBack className="w-4 h-4 mr-2" />
                Voltar para o blog
              </Link>

              <div className="text-gray-600 dark:text-gray-400">
                Publicado em{" "}
                {new Date(post.date).toLocaleDateString("pt-BR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
        </article>
      </div>
      <Footer />
    </>
  );
}
