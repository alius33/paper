"use client";

import {
  FileText,
  FlaskConical,
  Map,
  FileDown,
  Music,
  BookMarked,
  File,
  FolderOpen,
  FolderClosed,
} from "lucide-react";
import type { FileCategory } from "@/types/files";
import { cn } from "@/lib/utils";

interface FileIconProps {
  category: FileCategory;
  isDirectory?: boolean;
  isExpanded?: boolean;
  className?: string;
}

export function FileIcon({
  category,
  isDirectory,
  isExpanded,
  className,
}: FileIconProps) {
  const size = cn("h-4 w-4 flex-shrink-0", className);

  if (isDirectory) {
    return isExpanded ? (
      <FolderOpen className={cn(size, "text-accent")} />
    ) : (
      <FolderClosed className={cn(size, "text-accent")} />
    );
  }

  switch (category) {
    case "chapter":
      return <FileText className={cn(size, "text-[#8B5E3C]")} />;
    case "research":
      return <FlaskConical className={cn(size, "text-[#4A7EBD]")} />;
    case "plot":
      return <Map className={cn(size, "text-[#7E57A0]")} />;
    case "reference":
      return <FileDown className={cn(size, "text-muted-foreground")} />;
    case "media":
      return <Music className={cn(size, "text-[#4A9E6B]")} />;
    case "project-guide":
      return <BookMarked className={cn(size, "text-accent")} />;
    default:
      return <File className={cn(size, "text-muted-foreground")} />;
  }
}
