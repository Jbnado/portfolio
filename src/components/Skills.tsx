"use client";

import skills from "@/app/skills.json";
import {
  FaReact,
  FaAngular,
  FaNodeJs,
  FaJava,
  FaAws,
  FaGit,
  FaDocker,
  FaSass,
} from "react-icons/fa";
import {
  SiTypescript,
  SiNextdotjs,
  SiTailwindcss,
  SiStorybook,
  SiNestjs,
  SiSpringboot,
  SiExpress,
  SiMongodb,
  SiRabbitmq,
  SiCypress,
  SiJest,
} from "react-icons/si";
import { CgFileDocument } from "react-icons/cg";
import React from "react";
import { motion } from "framer-motion";

// Função para mapear o nome do ícone para o componente
const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    react: <FaReact className="w-full h-full text-blue-500" />,
    angular: <FaAngular className="w-full h-full text-red-600" />,
    typescript: <SiTypescript className="w-full h-full text-blue-600" />,
    nextjs: <SiNextdotjs className="w-full h-full" />,
    tailwind: <SiTailwindcss className="w-full h-full text-cyan-500" />,
    storybook: <SiStorybook className="w-full h-full text-pink-500" />,
    nodejs: <FaNodeJs className="w-full h-full text-green-600" />,
    nestjs: <SiNestjs className="w-full h-full text-red-600" />,
    java: <FaJava className="w-full h-full text-orange-600" />,
    "spring-boot": <SiSpringboot className="w-full h-full text-green-600" />,
    express: <SiExpress className="w-full h-full" />,
    mongodb: <SiMongodb className="w-full h-full text-green-500" />,
    rabbitmq: <SiRabbitmq className="w-full h-full text-orange-500" />,
    aws: <FaAws className="w-full h-full text-orange-400" />,
    cypress: (
      <SiCypress className="w-full h-full text-gray-700 dark:text-gray-300" />
    ),
    jest: <SiJest className="w-full h-full text-red-500" />,
    git: <FaGit className="w-full h-full text-orange-600" />,
    docker: <FaDocker className="w-full h-full text-blue-500" />,
    cicd: <CgFileDocument className="w-full h-full text-purple-500" />,
    sass: <FaSass className="w-full h-full text-pink-500" />,
  };

  return iconMap[iconName] || <CgFileDocument className="w-full h-full" />;
};

// Função para obter o efeito de hover baseado no tipo de habilidade
const getHoverEffect = (iconName: string) => {
  const effectMap: Record<
    string,
    {
      rotate?: number;
      scale?: number;
      y?: number;
      x?: number;
      skewX?: number;
      skewY?: number;
    }
  > = {
    // Efeito 1: Rotação completa
    react: { rotate: 360, scale: 1.1 },
    angular: { rotate: -360, scale: 1.1 },
    "spring-boot": { rotate: 360, scale: 1.1 },
    docker: { rotate: 360, scale: 1.1 },

    // Efeito 2: Movimento para cima
    typescript: { y: -8, scale: 1.1 },
    nodejs: { y: -8, scale: 1.1 },
    express: { y: -8, scale: 1.1 },
    git: { y: -8, scale: 1.1 },

    // Efeito 3: Movimento para os lados
    nextjs: { x: 5, scale: 1.2 },
    mongodb: { x: -5, scale: 1.2 },
    aws: { x: 5, scale: 1.1 },
    cypress: { x: -5, scale: 1.2 },

    // Efeito 4: Rotação parcial + escala
    tailwind: { rotate: 15, scale: 1.2 },
    storybook: { rotate: -15, scale: 1.2 },
    nestjs: { rotate: -15, scale: 1.1 },
    jest: { rotate: 15, scale: 1.1 },

    // Efeito 5: Inclinação (skew)
    java: { skewX: 10, scale: 1.2 },
    rabbitmq: { skewY: 10, scale: 1.1 },
    cicd: { skewX: -10, scale: 1.2 },
    sass: { skewY: -10, scale: 1.1 },
  };

  return effectMap[iconName] || { scale: 1.1, y: -3 };
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

export default function Skills() {
  return (
    <section className="py-12 px-4 bg-gray-50 dark:bg-gray-900">
      <motion.h2
        className="text-3xl font-bold text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        Habilidades
      </motion.h2>

      <motion.p
        className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Tecnologias e ferramentas que utilizo no meu dia a dia
      </motion.p>

      <div className="max-w-5xl mx-auto">
        {skills.map((category, index) => (
          <motion.div
            key={category.category}
            className="mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
          >
            <motion.h3
              className="text-xl font-semibold mb-6 text-cyan-700 dark:text-cyan-400"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {category.category}
            </motion.h3>

            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {category.skills.map((skill) => (
                <motion.div
                  key={skill.name}
                  className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all"
                  variants={item}
                  whileHover={{
                    y: -5,
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="w-12 h-12 mb-2 relative flex-shrink-0"
                    whileHover={getHoverEffect(skill.icon)}
                    transition={{
                      duration: 0.5,
                      type: "spring",
                      stiffness: 300,
                      damping: 10,
                    }}
                  >
                    {getIconComponent(skill.icon)}
                  </motion.div>
                  <p className="font-medium text-sm text-center">
                    {skill.name}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
