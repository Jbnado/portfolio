"use client";

import Image from "next/image";
import experiences from "@/app/experience.json";
import { motion } from "framer-motion";

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

export default function Experience() {
  return (
    <section className="py-12 px-4">
      <motion.h2
        className="text-3xl font-bold text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        Experiência Profissional
      </motion.h2>

      <motion.div
        className="max-w-4xl mx-auto space-y-8"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        {experiences.map((exp, index) => (
          <motion.div
            key={exp.company}
            className="group p-6 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-cyan-500 transition-all"
            variants={item}
            whileHover={{
              y: -5,
              boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
              borderColor: "#06b6d4",
            }}
          >
            <div className="flex justify-between items-start">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              >
                <h3 className="text-xl font-semibold">{exp.company}</h3>
                <p className="text-gray-600 dark:text-gray-400">{exp.role}</p>
                <p className="text-sm text-cyan-600">{exp.period}</p>
              </motion.div>

              <motion.div
                className="w-16 h-16 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Image
                  src={`/images/logos/${exp.logo}`}
                  alt={exp.company}
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </motion.div>
            </div>

            <motion.ul
              className="mt-4 space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
            >
              {exp.highlights.map((highlight, i) => (
                <motion.li
                  key={i}
                  className="flex items-start before:content-['▹'] before:text-cyan-500 before:mr-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.5 + i * 0.1 + index * 0.1,
                  }}
                >
                  {highlight}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
