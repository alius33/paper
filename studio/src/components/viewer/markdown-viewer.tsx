"use client";

import { useMemo } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { cn } from "@/lib/utils";

interface MarkdownViewerProps {
  content: string;
  filePath: string;
  className?: string;
}

function isChapterFile(filePath: string): boolean {
  return filePath.startsWith("chapters/") && filePath.endsWith(".md");
}

export function MarkdownViewer({
  content,
  filePath,
  className,
}: MarkdownViewerProps) {
  const isChapter = isChapterFile(filePath);

  const components: Components = useMemo(
    () => ({
      h1: ({ children, ...props }) => (
        <h1
          className="text-2xl font-bold mt-8 mb-4 text-primary font-sans leading-tight"
          {...props}
        >
          {children}
        </h1>
      ),
      h2: ({ children, ...props }) => (
        <h2
          className="text-xl font-semibold mt-6 mb-3 text-primary font-sans leading-snug"
          {...props}
        >
          {children}
        </h2>
      ),
      h3: ({ children, ...props }) => (
        <h3
          className="text-lg font-semibold mt-5 mb-2 text-primary font-sans"
          {...props}
        >
          {children}
        </h3>
      ),
      h4: ({ children, ...props }) => (
        <h4
          className="text-base font-semibold mt-4 mb-2 text-primary font-sans"
          {...props}
        >
          {children}
        </h4>
      ),
      h5: ({ children, ...props }) => (
        <h5
          className="text-sm font-semibold mt-3 mb-1 text-primary font-sans"
          {...props}
        >
          {children}
        </h5>
      ),
      h6: ({ children, ...props }) => (
        <h6
          className="text-xs font-semibold mt-3 mb-1 text-primary font-sans uppercase tracking-wide"
          {...props}
        >
          {children}
        </h6>
      ),
      p: ({ children, ...props }) => (
        <p className="mb-4 leading-relaxed" {...props}>
          {children}
        </p>
      ),
      strong: ({ children, ...props }) => (
        <strong className="font-bold" {...props}>
          {children}
        </strong>
      ),
      em: ({ children, ...props }) => (
        <em className="italic" {...props}>
          {children}
        </em>
      ),
      blockquote: ({ children, ...props }) => (
        <blockquote
          className="border-l-3 border-accent pl-4 my-4 text-muted-foreground italic"
          {...props}
        >
          {children}
        </blockquote>
      ),
      ul: ({ children, ...props }) => (
        <ul className="list-disc pl-6 mb-4 space-y-1" {...props}>
          {children}
        </ul>
      ),
      ol: ({ children, ...props }) => (
        <ol className="list-decimal pl-6 mb-4 space-y-1" {...props}>
          {children}
        </ol>
      ),
      li: ({ children, ...props }) => (
        <li className="leading-relaxed" {...props}>
          {children}
        </li>
      ),
      a: ({ children, href, ...props }) => (
        <a
          href={href}
          className="text-primary underline underline-offset-2 hover:text-accent transition-colors"
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      ),
      code: ({ children, className: codeClassName, ...props }) => {
        // Inline code vs code block detection: if there's a language class, it's a block
        const isBlock = codeClassName?.startsWith("language-");
        if (isBlock) {
          return (
            <code className={cn("text-sm", codeClassName)} {...props}>
              {children}
            </code>
          );
        }
        return (
          <code
            className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
            {...props}
          >
            {children}
          </code>
        );
      },
      pre: ({ children, ...props }) => (
        <pre
          className="bg-muted rounded-md p-4 overflow-x-auto my-4 text-sm font-mono"
          {...props}
        >
          {children}
        </pre>
      ),
      hr: () => (
        <div className="my-8 text-center">
          <span className="text-muted-foreground tracking-[0.5em] font-serif text-sm">
            * * *
          </span>
        </div>
      ),
      table: ({ children, ...props }) => (
        <div className="overflow-x-auto my-4">
          <table
            className="w-full border-collapse text-sm"
            {...props}
          >
            {children}
          </table>
        </div>
      ),
      thead: ({ children, ...props }) => (
        <thead className="border-b-2 border-border" {...props}>
          {children}
        </thead>
      ),
      tbody: ({ children, ...props }) => (
        <tbody className="divide-y divide-border" {...props}>
          {children}
        </tbody>
      ),
      tr: ({ children, ...props }) => (
        <tr className="hover:bg-muted/50" {...props}>
          {children}
        </tr>
      ),
      th: ({ children, ...props }) => (
        <th
          className="px-3 py-2 text-left font-semibold text-primary"
          {...props}
        >
          {children}
        </th>
      ),
      td: ({ children, ...props }) => (
        <td className="px-3 py-2" {...props}>
          {children}
        </td>
      ),
      img: ({ alt, src, ...props }) => (
        <span className="block my-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt || ""}
            className="max-w-full rounded-md"
            {...props}
          />
          {alt && (
            <span className="block text-xs text-muted-foreground mt-1 italic text-center">
              {alt}
            </span>
          )}
        </span>
      ),
    }),
    []
  );

  return (
    <div
      className={cn(
        "overflow-y-auto",
        isChapter ? "font-serif text-lg leading-[1.8]" : "font-sans text-sm leading-relaxed",
        className
      )}
    >
      <div className={cn("max-w-3xl mx-auto", isChapter ? "px-6 py-8" : "px-6 py-6")}>
        <Markdown remarkPlugins={[remarkGfm]} components={components}>
          {content}
        </Markdown>
      </div>
    </div>
  );
}
