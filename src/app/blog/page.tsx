import Link from "next/link";
import Image from "next/image";
import { getPosts } from "@/lib/blog";
import type { Post } from "@/lib/blog";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Blog | João Bernardo",
  description:
    "Artigos técnicos sobre desenvolvimento web, React, TypeScript, Node.js e mais.",
  keywords: "blog, desenvolvimento web, react, typescript, nodejs",
};

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <>
      <Navbar />
      <div className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Blog</h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Artigos técnicos sobre desenvolvimento web, React, TypeScript,
              Node.js e mais.
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                Nenhum artigo publicado ainda. Em breve novos conteúdos!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map((post: Post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="block group"
                >
                  <article className="h-full border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden hover:border-cyan-500 transition-colors">
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="p-6">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {new Date(post.date).toLocaleDateString("pt-BR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>

                      <h2 className="text-xl font-semibold mb-2 group-hover:text-cyan-600 transition-colors">
                        {post.title}
                      </h2>

                      <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                        {post.excerpt}
                      </p>

                      <div className="mt-4 text-cyan-600 font-medium group-hover:text-cyan-500">
                        Ler artigo →
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
