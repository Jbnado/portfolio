"use client";

import Image from "next/image";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { motion } from "framer-motion";
import React from "react";
import SocialIcon from "./SocialIcon";

export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col md:flex-row items-center justify-center gap-8 p-6">
      <motion.div
        className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-cyan-500 hover:scale-105 transition-transform"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.05, borderColor: "#0891b2" }}
      >
        <Image
          src="/images/serio.jpg"
          alt="João Bernardo"
          fill
          className="object-cover scale-110"
          priority
        />
      </motion.div>

      <motion.div
        className="text-center md:text-left space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.h1
          className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          João Bernardo
        </motion.h1>
        <motion.p
          className="text-xl text-gray-600 dark:text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          Full Stack Developer
        </motion.p>

        <motion.div
          className="flex justify-center md:justify-start gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <motion.a
            href="/Bernardo-CV.pdf"
            download
            className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Baixar CV
          </motion.a>
          <div className="flex gap-3">
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
