"use client";

import Link from "next/link";
import { useState } from "react";
import {
  MdPerson,
  MdWork,
  MdCode,
  MdOutlineArticle,
  MdMenu,
  MdClose,
  MdOutlineWeb,
} from "react-icons/md";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="text-xl font-bold text-cyan-600">
            JB<span className="text-gray-800 dark:text-white">nado</span>
          </Link>

          <div className="hidden md:flex space-x-8">
            <NavLink href="/#sobre">Sobre</NavLink>
            <NavLink href="/#experiencia">Experiência</NavLink>
            <NavLink href="/#habilidades">Habilidades</NavLink>
            <NavLink href="/#projetos">Projetos</NavLink>
            <NavLink href="/blog">Blog</NavLink>
          </div>

          <button
            type="button"
            className="md:hidden text-gray-700 dark:text-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-md p-1"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? (
              <MdClose className="w-6 h-6" />
            ) : (
              <MdMenu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden absolute top-16 inset-x-0 bg-white dark:bg-gray-900 shadow-lg"
          role="dialog"
          aria-label="Menu de navegação"
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            <MobileNavLink
              href="/#sobre"
              onClick={() => setIsMenuOpen(false)}
              icon={<MdPerson className="w-5 h-5" />}
            >
              Sobre
            </MobileNavLink>
            <MobileNavLink
              href="/#experiencia"
              onClick={() => setIsMenuOpen(false)}
              icon={<MdWork className="w-5 h-5" />}
            >
              Experiência
            </MobileNavLink>
            <MobileNavLink
              href="/#projetos"
              onClick={() => setIsMenuOpen(false)}
              icon={<MdOutlineWeb className="w-5 h-5" />}
            >
              Projetos
            </MobileNavLink>
            <MobileNavLink
              href="/#habilidades"
              onClick={() => setIsMenuOpen(false)}
              icon={<MdCode className="w-5 h-5" />}
            >
              Habilidades
            </MobileNavLink>
            <MobileNavLink
              href="/blog"
              onClick={() => setIsMenuOpen(false)}
              icon={<MdOutlineArticle className="w-5 h-5" />}
            >
              Blog
            </MobileNavLink>
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  onClick,
  icon,
  children,
}: {
  href: string;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
      onClick={onClick}
    >
      <span className="mr-3 text-cyan-600">{icon}</span>
      {children}
    </Link>
  );
}
