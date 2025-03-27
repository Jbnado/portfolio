"use client";

import Hero from "@/components/Hero";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Skills from "@/components/Skills";
import Footer from "@/components/Footer";
import PageTransition, { FadeInUp } from "@/components/PageTransition";

export default function HomePage() {
  return (
    <PageTransition>
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
          <FadeInUp>
            <h2 className="text-3xl font-bold text-center mb-8">Projetos</h2>
            <p className="text-center text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Em breve, esta seção será atualizada com meus projetos mais
              recentes. Enquanto isso, visite meu{" "}
              <a
                href="https://github.com/Jbnado"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-600 hover:text-cyan-700 dark:hover:text-cyan-400 transition-colors underline decoration-dotted decoration-1 underline-offset-2 hover:decoration-solid"
              >
                GitHub
              </a>{" "}
              para ver meus trabalhos atuais.
            </p>
          </FadeInUp>
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
}
