"use client";

import { motion } from "framer-motion";
import React from "react";

interface SocialIconProps {
  url: string;
  icon: React.ReactNode;
}

export default function SocialIcon({ url, icon }: SocialIconProps) {
  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-cyan-100 dark:hover:bg-cyan-900 transition-colors"
      whileHover={{ scale: 1.1, backgroundColor: "#cffafe" }}
      whileTap={{ scale: 0.9 }}
    >
      <span className="sr-only">{url.split(".")[1]}</span>
      {icon}
    </motion.a>
  );
}
