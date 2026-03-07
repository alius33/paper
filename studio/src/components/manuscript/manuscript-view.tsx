"use client";

import { useEffect, useState } from "react";
import { ChapterCard } from "./chapter-card";

interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
  wordCount?: number;
}

interface ChapterData {
  path: string;
  wordCount: number;
}

const MANUSCRIPT_STRUCTURE = {
  parts: [
    {
      title: "Part I: The Road",
      range: "Chapters 1-5",
      chapters: [
        { number: 1, title: "The Journey to Kufa", summary: "Caravan departure from Baghdad; first night on the road; meeting Sa'dan and Sayeed.", status: "Revised" as const, file: "ch01-the-journey-to-kufa.md" },
        { number: 2, title: "The Caliph's Road", summary: "First days on the road; khan accommodation; tribal riders; Umar's backstory.", status: "Draft" as const, file: "ch02-the-caliphs-road.md" },
        { number: 3, title: "The Wounded Heart", summary: "Arrival in Kufa; the bread thief Tariq; the failed paper sales; commercial education.", status: "Draft" as const, file: "ch03-the-wounded-heart.md" },
        { number: 4, title: "The Poisoned Vat", summary: "Return to workshop; siyaq accounting script; Jabir's sabotage and expulsion.", status: "Draft" as const, file: "ch04-the-poisoned-vat.md" },
        { number: 5, title: "The Suq al-Warraqin", summary: "First solo selling mission in Baghdad's paper market; the donkey; learning to sell.", status: "Final" as const, file: "ch05-the-suq-al-warraqin.md" },
      ],
    },
    {
      title: "Part II: The Wide World",
      range: "Chapters 6-10",
      chapters: [
        { number: 6, title: "The Mountain Passage", summary: "Zagros crossing with Musa; mountain dangers; deepening friendship.", status: "Planned" as const, file: "ch06-the-mountain-passage.md" },
        { number: 7, title: "The Pearl of Khorasan", summary: "Arrival in Rayy; Silk Road crossroads; new commercial horizons.", status: "Planned" as const, file: "ch07-the-pearl-of-khorasan.md" },
        { number: 8, title: "The Damascus Road", summary: "Desert crossing; reading the land; survival and navigation.", status: "Planned" as const, file: "ch08-the-damascus-road.md" },
        { number: 9, title: "The Northern Gate", summary: "Mosul; northern trade routes; expanding commercial knowledge.", status: "Planned" as const, file: "ch09-the-northern-gate.md" },
        { number: 10, title: "The Sogdian's Shadow", summary: "Merv; Dastan destroyed at the governor's auction; the silk gamble.", status: "Planned" as const, file: "ch10-the-sogdians-shadow.md" },
      ],
    },
    {
      title: "Part III: The Choice",
      range: "Chapters 11-13",
      chapters: [
        { number: 11, title: "The Reckoning", summary: "Confrontation with Abu Said; reckoning with ambition and loyalty.", status: "Planned" as const, file: "ch11-the-reckoning.md" },
        { number: 12, title: "The Inheritance", summary: "Ali reveals the family trust; the weight of legacy.", status: "Planned" as const, file: "ch12-the-inheritance.md" },
        { number: 13, title: "The House of Paper", summary: "The founding; Omar al-Dimashqi and Ishaq join; a new beginning.", status: "Planned" as const, file: "ch13-the-house-of-paper.md" },
      ],
    },
  ],
};

function collectChapterData(nodes: FileNode[]): Map<string, ChapterData> {
  const map = new Map<string, ChapterData>();
  for (const node of nodes) {
    if (node.type === "file" && node.path.startsWith("chapters/book-1/") && node.name.endsWith(".md")) {
      map.set(node.name, {
        path: node.path,
        wordCount: node.wordCount || 0,
      });
    }
    if (node.children) {
      const childMap = collectChapterData(node.children);
      childMap.forEach((v, k) => map.set(k, v));
    }
  }
  return map;
}

export function ManuscriptView() {
  const [chapterData, setChapterData] = useState<Map<string, ChapterData>>(new Map());

  useEffect(() => {
    fetch("/api/files")
      .then((r) => r.json())
      .then((data) => {
        if (data.tree) {
          setChapterData(collectChapterData(data.tree));
        }
      })
      .catch(() => {});
  }, []);

  const totalWords = Array.from(chapterData.values()).reduce((sum, d) => sum + d.wordCount, 0);
  const draftedCount = chapterData.size;
  const TARGET_WORDS = 90000;
  const progressPct = Math.min((totalWords / TARGET_WORDS) * 100, 100);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[1100px] mx-auto px-6 py-8 md:px-8 md:py-10">
        {/* Header */}
        <h1 className="text-[26px] font-bold tracking-tight text-foreground">
          Book 1: The House of Paper
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          13 chapters planned &middot; {draftedCount} drafted &middot;{" "}
          {totalWords.toLocaleString()} of ~90,000 words
        </p>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="font-mono text-xs text-muted-foreground mt-1.5">
            {progressPct.toFixed(1)}% complete
          </p>
        </div>

        {/* Parts */}
        {MANUSCRIPT_STRUCTURE.parts.map((part) => (
          <div key={part.title}>
            {/* Part header */}
            <div className="flex justify-between items-baseline border-b-2 border-border pb-2 mb-4 mt-10">
              <h2 className="text-[15px] font-bold text-foreground">{part.title}</h2>
              <span className="font-mono text-[11px] text-muted-foreground">
                {part.range}
              </span>
            </div>

            {/* Chapter cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {part.chapters.map((ch) => {
                const data = chapterData.get(ch.file);
                return (
                  <ChapterCard
                    key={ch.number}
                    number={ch.number}
                    title={ch.title}
                    summary={ch.summary}
                    status={ch.status}
                    wordCount={data?.wordCount}
                    path={data?.path}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
