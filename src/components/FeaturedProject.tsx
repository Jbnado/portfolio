"use client";

import { motion } from "framer-motion";
import { FaExternalLinkAlt } from "react-icons/fa";
import Image from "next/image";
import projects from "@/app/projects.json";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 15,
    },
  },
};

export default function FeaturedProject() {
  const featuredProjects = projects.filter((project) => project.featured);

  return (
    <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          id="projetos-destaque-heading"
          className="text-3xl font-bold text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {featuredProjects.length === 1
            ? "Projeto em Destaque"
            : "Projetos em Destaque"}
        </motion.h2>

        <motion.div
          className="space-y-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {featuredProjects.map((project) => (
            <motion.article
              key={project.id}
              aria-labelledby={`${project.id}-title`}
              className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-800/60 backdrop-blur shadow-sm hover:shadow-xl transition-all"
              variants={item}
              whileHover={{ y: -3 }}
            >
              <div className="grid md:grid-cols-2 gap-6">
                {/* Image */}
                <div className="relative h-64 md:h-auto overflow-hidden">
                  <Image
                    src={`/images/projects/${project.image}`}
                    alt={`Capa do projeto ${project.title}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 flex flex-col justify-between">
                  <div>
                    <header className="mb-4">
                      <h3
                        id={`${project.id}-title`}
                        className="text-2xl font-semibold tracking-tight mb-2"
                      >
                        {project.title}
                      </h3>
                      <p className="text-sm text-cyan-600 dark:text-cyan-400">
                        {project.subtitle}
                      </p>
                    </header>

                    <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                      {project.description}
                    </p>

                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      {project.highlights.map((highlight, idx) => (
                        <li
                          key={idx}
                          className="flex items-start before:content-['▹'] before:text-cyan-500 before:mr-2 before:font-bold"
                        >
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div
                    className="mt-6 flex flex-wrap gap-3"
                    role="group"
                    aria-label={`Links do projeto ${project.shortTitle}`}
                  >
                    {project.links.website && (
                      <motion.a
                        href={project.links.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-cyan-600 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        aria-label={`Saiba mais sobre ${project.shortTitle}`}
                      >
                        <FaExternalLinkAlt /> Saiba Mais
                      </motion.a>
                    )}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
