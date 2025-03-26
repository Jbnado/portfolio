import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

export interface Post {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  coverImage: string;
  altImage: string;
  content: string;
}

const postsDirectory = path.join(process.cwd(), "src/content/blog");

export async function getPosts(): Promise<Post[]> {
  try {
    const fileNames = await fs.readdir(postsDirectory);

    const allPostsData = await Promise.all(
      fileNames
        .filter((fileName) => fileName.endsWith(".mdx"))
        .map(async (fileName) => {
          // Remover a extensão .mdx para obter o slug
          const slug = fileName.replace(/\.mdx$/, "");

          // Ler o conteúdo do arquivo
          const fullPath = path.join(postsDirectory, fileName);
          const fileContents = await fs.readFile(fullPath, "utf8");

          // Usar gray-matter para analisar a seção de metadados
          const { data, content } = matter(fileContents);

          // Validar a data e formatar corretamente
          let formattedDate;
          try {
            formattedDate =
              data.date instanceof Date
                ? data.date.toISOString()
                : new Date(data.date).toISOString();
          } catch {
            console.error(`Data inválida no post ${slug}:`, data.date);
            // Usar data atual como fallback
            formattedDate = new Date().toISOString();
          }

          return {
            slug,
            title: data.title || "Sem título",
            date: formattedDate,
            excerpt: data.excerpt || "",
            coverImage: data.coverImage || "/blog-images/default.jpg",
            altImage: data.altImage || data.title || "",
            content,
          };
        })
    );

    // Ordenar posts pela data, do mais recente para o mais antigo
    return allPostsData.sort(
      (a: Post, b: Post) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (error) {
    // Se o diretório ainda não existir, retornar um array vazio
    console.error("Erro ao buscar posts:", error);
    return [];
  }
}

export async function getPost(slug: string): Promise<Post | null> {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.mdx`);
    const fileContents = await fs.readFile(fullPath, "utf8");

    // Usar gray-matter para analisar a seção de metadados
    const { data, content } = matter(fileContents);

    // Validar a data e formatar corretamente
    let formattedDate;
    try {
      formattedDate =
        data.date instanceof Date
          ? data.date.toISOString()
          : new Date(data.date).toISOString();
    } catch {
      console.error(`Data inválida no post ${slug}:`, data.date);
      // Usar data atual como fallback
      formattedDate = new Date().toISOString();
    }

    return {
      slug,
      title: data.title || "Sem título",
      date: formattedDate,
      excerpt: data.excerpt || "",
      coverImage: data.coverImage,
      altImage: data.altImage || data.title || "",
      content,
    };
  } catch (error) {
    console.error("Erro ao buscar post:", error);
    return null;
  }
}
