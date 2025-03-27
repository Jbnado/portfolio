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
        className="text-center text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Nenhuma habilidade está em 100% pois acredito que estamos sempre
        aprendendo e evoluindo constantemente.
      </motion.p>

      <div className="max-w-4xl mx-auto">
        {skills.map((category, index) => (
          <motion.div
            key={category.category}
            className="mb-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
          >
            <motion.h3
              className="text-xl font-semibold mb-4 text-cyan-700 dark:text-cyan-400"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {category.category}
            </motion.h3>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {category.skills.map((skill) => (
                <motion.div
                  key={skill.name}
                  className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  variants={item}
                  whileHover={{
                    y: -5,
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="w-8 h-8 relative flex-shrink-0"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      {getIconComponent(skill.icon)}
                    </motion.div>
                    <div className="flex-grow">
                      <p className="font-medium">{skill.name}</p>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                        <motion.div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                          style={{ width: "0%" }}
                          animate={{ width: `${skill.level}%` }}
                          transition={{
                            duration: 1,
                            delay: 0.2,
                            ease: "easeOut",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
