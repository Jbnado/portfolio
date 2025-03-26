"use client";

import React, { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

interface MarkdownContentProps {
  content: string;
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  // Função para processar diagramas mermaid se existirem
  useEffect(() => {
    if (typeof window !== "undefined" && content.includes("```mermaid")) {
      import("mermaid").then((mermaid) => {
        mermaid.default.initialize({
          startOnLoad: true,
          theme: document.documentElement.classList.contains("dark")
            ? "dark"
            : "default",
          securityLevel: "loose",
        });
        mermaid.default.run();
      });
    }
  }, [content]);

  return (
    <div className="prose prose-lg dark:prose-invert max-w-none markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
