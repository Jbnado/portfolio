"use client";

import Image from "next/image";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { motion } from "framer-motion";
import React from "react";
import SocialIcon from "./SocialIcon";
import ParticlesBackground from "./ParticlesBackground";

export default function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative min-h-screen flex flex-col md:flex-row items-center justify-center gap-10 p-6 md:p-12"
    >
      <ParticlesBackground />
      <motion.div
        className="relative w-56 h-56 md:w-64 md:h-64 rounded-full overflow-hidden ring-4 ring-cyan-500/70 ring-offset-4 ring-offset-gray-950 shadow-xl focus-within:outline-none"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        whileHover={{ scale: 1.04, rotate: 1.5 }}
      >
        <Image
          src="/images/serio.jpg"
          alt="Retrato de João Bernardo sorrindo levemente, em fundo neutro"
          fill
          className="object-cover scale-110"
          priority
        />
      </motion.div>

      <motion.div
        className="max-w-2xl text-center md:text-left space-y-5"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        <motion.h1
          id="hero-heading"
          className="text-4xl md:text-5xl font-extrabold leading-tight bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 bg-clip-text text-transparent tracking-tight"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          João Bernardo (JB)
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl text-gray-300"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          Desenvolvedor Full Stack focado em arquitetura de microserviços,
          performance e impacto educacional. Construo APIs resilientes (Java,
          Spring Boot, NestJS), interfaces acessíveis (React/Next.js) e soluções
          que promovem inclusão tecnológica.
        </motion.p>
        <motion.p
          className="text-base text-gray-400 max-w-xl mx-auto md:mx-0"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
        >
          Atualmente na Verzel e pesquisando interseções entre desenvolvimento
          de software, automação (RPA) e experiências educacionais imersivas.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center md:items-start gap-4 pt-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          <motion.a
            href="/Bernardo-CV.pdf"
            download
            className="group relative inline-flex items-center justify-center gap-2 px-7 py-3 rounded-lg bg-cyan-600 text-white font-medium shadow-lg shadow-cyan-600/30 hover:bg-cyan-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-400 transition"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            aria-label="Baixar currículo em PDF"
          >
            <span>Baixar CV</span>
            <span className="absolute inset-0 rounded-lg ring-2 ring-cyan-400/0 group-hover:ring-cyan-300/60 transition" />
          </motion.a>
          <div className="flex gap-3" aria-label="Redes sociais">
            <SocialIcon
              url="https://www.linkedin.com/in/jbnado"
              icon={<FaLinkedin className="w-6 h-6" />}
            />
            <SocialIcon
              url="https://github.com/Jbnado"
              icon={<FaGithub className="w-6 h-6" />}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
