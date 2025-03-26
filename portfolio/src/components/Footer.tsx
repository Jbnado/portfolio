"use client";

import Link from "next/link";
import { HTMLAttributes } from "react";
import { FaLinkedin, FaGithub } from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <Link href="/" className="text-xl font-bold text-cyan-600">
              JB<span className="text-gray-800 dark:text-white">nado</span>
            </Link>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Desenvolvedor Full Stack
            </p>
          </div>

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
            <p className="text-sm text-gray-600 dark:text-gray-400">
              &copy; {currentYear} João Bernardo. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

interface SocialLinkProps extends HTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

function SocialLink({ href, children, ...props }: SocialLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
      {...props}
    >
      {children}
    </a>
  );
}
