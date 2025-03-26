"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

// Importação dinâmica do componente client-side
const MarkdownContent = dynamic(() => import("@/components/MarkdownContent"), {
  loading: () => (
    <div className="animate-pulse h-96 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
  ),
});

interface ClientMarkdownRendererProps {
  content: string;
}

export default function ClientMarkdownRenderer({
  content,
}: ClientMarkdownRendererProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="animate-pulse h-96 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
    );
  }

  return <MarkdownContent content={content} />;
}
