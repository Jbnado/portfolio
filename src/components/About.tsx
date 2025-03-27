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
    <section className="py-12 px-4" id="sobre">
      <motion.h2
        className="text-3xl font-bold text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        Sobre Mim
      </motion.h2>
      <motion.div
        className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        whileHover={{ boxShadow: "0px 8px 30px rgba(0, 0, 0, 0.12)" }}
      >
        <motion.div
          className="space-y-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <motion.div className="flex items-start" variants={item}>
            <motion.div
              whileHover={{ scale: 1.2, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <MdPerson className="w-6 h-6 text-cyan-600 mr-3 mt-1 flex-shrink-0" />
            </motion.div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Quem sou</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Desenvolvedor Full Stack com 3+ anos de experiência liderando
                projetos web complexos. Apaixonado por criar soluções escaláveis
                usando tecnologias modernas e boas práticas de arquitetura de
                software.
              </p>
            </div>
          </motion.div>

          <motion.div className="flex items-start" variants={item}>
            <motion.div
              whileHover={{ scale: 1.2, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <MdSchool className="w-6 h-6 text-cyan-600 mr-3 mt-1 flex-shrink-0" />
            </motion.div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Formação</h3>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">FATEC Ribeirão Preto</span>
                <br />
                Tecnólogo em Análise e Desenvolvimento de Sistemas
                <br />
                2019 - 2025 (Previsão de conclusão)
              </p>
            </div>
          </motion.div>

          <motion.div className="flex items-start" variants={item}>
            <motion.div
              whileHover={{ scale: 1.2, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <FaLaptopCode className="w-6 h-6 text-cyan-600 mr-3 mt-1 flex-shrink-0" />
            </motion.div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Especialidades</h3>
              <p className="text-gray-700 dark:text-gray-300">
                • Arquitetura de microserviços com Java Spring Boot e Node.js
                <br />
                • Sistemas distribuídos usando AWS e RabbitMQ
                <br />
                • Front-end moderno com React, Angular e Storybook
                <br />
                • Qualidade de código com Cypress e testes automatizados
                <br />• Mentoria de desenvolvedores juniores e gestão técnica
              </p>
            </div>
          </motion.div>

          <motion.div className="flex items-start" variants={item}>
            <motion.div
              whileHover={{ scale: 1.2, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <FaGlobeAmericas className="w-6 h-6 text-cyan-600 mr-3 mt-1 flex-shrink-0" />
            </motion.div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Idiomas</h3>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Português:</span> Nativo
                <br />
                <span className="font-medium">Inglês:</span> Avançado
                <br />
              </p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
