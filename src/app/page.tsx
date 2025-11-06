"use client";

import Hero from "@/components/Hero";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Skills from "@/components/Skills";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import FeaturedProject from "@/components/FeaturedProject";

export default function HomePage() {
  return (
    <PageTransition>
      <main id="main-content" role="main" aria-label="Conteúdo principal">
        <div id="home">
          <Hero />
        </div>

        <div id="sobre">
          <About />
        </div>

        <div id="experiencia">
          <Experience />
        </div>

        <div id="projetos">
          <FeaturedProject />
        </div>

        <div id="habilidades">
          <Skills />
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
}
