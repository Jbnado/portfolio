import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Skills from "@/components/Skills";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "João Bernardo | Desenvolvedor Full Stack",
  description:
    "Portfolio do profissional João Bernardo, desenvolvedor full stack com foco em TypeScript e conhecimentos em React, Next.js, Node.js, SQL e NoSQL.",
  keywords:
    "desenvolvedor full stack, react, nextjs, typescript, nodejs, java, javascript, sql, nosql, nestjs, portfolio",
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <div id="home">
          <Hero />
        </div>

        <div id="sobre">
          <About />
        </div>

        <div id="experiencia">
          <Experience />
        </div>

        <div id="habilidades">
          <Skills />
        </div>

        <div id="projetos" className="py-12 px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Projetos</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Em breve, esta seção será atualizada com meus projetos mais
            recentes. Enquanto isso, visite meu{" "}
            <a
              href="https://github.com/Jbnado"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-600 hover:text-cyan-700 dark:hover:text-cyan-400"
            >
              GitHub
            </a>{" "}
            para ver meus trabalhos atuais.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
