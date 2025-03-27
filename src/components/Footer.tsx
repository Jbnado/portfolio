"use client";

import Link from "next/link";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex flex-col md:flex-row justify-between items-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <motion.div
            className="mb-4 md:mb-0 text-center md:text-left"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Link href="/" className="text-xl font-bold text-cyan-600">
              <motion.span whileHover={{ color: "#0e7490" }}>
                JB<span className="text-gray-800 dark:text-white">nado</span>
              </motion.span>
            </Link>
            <motion.p
              className="mt-2 text-sm text-gray-600 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Desenvolvedor Full Stack
            </motion.p>
          </motion.div>

          <div className="flex flex-col items-center md:items-end">
            <div className="flex space-x-4 mb-4">
              <SocialLink
                href="https://linkedin.com/in/jbnado"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="w-5 h-5" />
              </SocialLink>
              <SocialLink href="https://github.com/Jbnado" aria-label="GitHub">
                <FaGithub className="w-5 h-5" />
              </SocialLink>
            </div>
            <motion.p
              className="text-sm text-gray-600 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              &copy; {currentYear} João Bernardo. Todos os direitos reservados.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

interface SocialLinkProps {
  href: string;
  children: React.ReactNode;
  "aria-label"?: string;
}

function SocialLink({ href, children, ...props }: SocialLinkProps) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
      whileHover={{ scale: 1.2, rotate: 5, color: "#0891b2" }}
      whileTap={{ scale: 0.9 }}
      {...props}
    >
      {children}
    </motion.a>
  );
}
