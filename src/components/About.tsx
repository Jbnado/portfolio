"use client";

import { FaLaptopCode, FaGlobeAmericas } from "react-icons/fa";
import { MdPerson, MdSchool } from "react-icons/md";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const item = {
  hidden: { opacity: 0, x: -20 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 100,
    },
  },
};

export default function About() {
  return (
    <section id="sobre" aria-labelledby="sobre-heading" className="py-16 px-4">
      <motion.h2
        id="sobre-heading"
        className="text-3xl font-bold text-center mb-10"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        Sobre Mim
      </motion.h2>
      <motion.div
        role="region"
        aria-label="Resumo sobre João Bernardo"
        className="max-w-5xl mx-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700 shadow-lg"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <motion.div
          className="space-y-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <motion.div className="flex items-start" variants={item}>
            <motion.div
              whileHover={{ scale: 1.15, rotate: 3 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <MdPerson className="w-7 h-7 text-cyan-500 mr-4 mt-1 flex-shrink-0" />
            </motion.div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Quem sou</h3>
              <p className="text-gray-300 leading-relaxed">
                Full Stack Developer com foco em arquitetura limpa, automação
                (RPA) e experiências educacionais inclusivas. Transformo
                requisitos complexos em plataformas escaláveis, observáveis e
                seguras, aproximando tecnologia de pessoas.
              </p>
            </div>
          </motion.div>

          <motion.div className="flex items-start" variants={item}>
            <motion.div
              whileHover={{ scale: 1.15, rotate: 3 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <MdSchool className="w-7 h-7 text-cyan-500 mr-4 mt-1 flex-shrink-0" />
            </motion.div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Formação</h3>
              <p className="text-gray-300">
                Tecnólogo em Análise e Desenvolvimento de Sistemas — FATEC
                Ribeirão Preto (2019 - 2025, previsão de conclusão)
              </p>
            </div>
          </motion.div>

          <motion.div className="flex items-start" variants={item}>
            <motion.div
              whileHover={{ scale: 1.15, rotate: 3 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <FaLaptopCode className="w-7 h-7 text-cyan-500 mr-4 mt-1 flex-shrink-0" />
            </motion.div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Especialidades</h3>
              <ul className="space-y-2 text-gray-300 list-disc pl-5">
                <li>Arquitetura de microserviços (Java Spring Boot, NestJS)</li>
                <li>APIs resilientes e observabilidade (logs estruturados)</li>
                <li>Automação RPA com Python e Playwright</li>
                <li>Front-end acessível e performático (React / Next.js)</li>
                <li>Qualidade de código: testes (Jest, Cypress) & revisão</li>
                <li>Mentoria técnica e documentação clara</li>
              </ul>
            </div>
          </motion.div>

          <motion.div className="flex items-start" variants={item}>
            <motion.div
              whileHover={{ scale: 1.15, rotate: 3 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <FaGlobeAmericas className="w-7 h-7 text-cyan-500 mr-4 mt-1 flex-shrink-0" />
            </motion.div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Idiomas</h3>
              <p className="text-gray-300">
                <span className="font-medium">Português:</span> Nativo
                <br />
                <span className="font-medium">Inglês:</span> Avançado
              </p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
