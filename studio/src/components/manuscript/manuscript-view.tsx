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
      range: "Chapters 1–9",
      chapters: [
        { number: 1, title: "The Journey to Kufa", summary: "Caravan departure from Baghdad; first night on the road; meeting Sa'dan and Sayeed.", status: "Revised" as const, file: "ch01-the-journey-to-kufa.md" },
        { number: 2, title: "The Caliph's Road", summary: "Days 1–3 on the road; khan accommodation; ink merchant intelligence; Umar's backstory.", status: "Draft" as const, file: "ch02-the-caliphs-road.md" },
        { number: 3, title: "The Mother's Country", summary: "Days 4–5; Banu Asad riders parallel the caravan; Layla's identity fracture; farewell to Sa'dan.", status: "Draft" as const, file: "ch03-the-mothers-country.md" },
        { number: 4, title: "The Wounded Heart", summary: "Arrival in Kufa; Umar at the Great Mosque; the bread thief Tariq; the failed paper sales.", status: "Planned" as const, file: "ch04-the-wounded-heart.md" },
        { number: 5, title: "The Poisoned Vat", summary: "Return to workshop; Abu Said's assessment; siyaq accounting script; Jabir's sabotage and expulsion.", status: "Planned" as const, file: "ch05-the-poisoned-vat.md" },
        { number: 6, title: "The Suq al-Warraqin", summary: "First solo selling mission in Baghdad's paper market; the donkey; learning to sell.", status: "Planned" as const, file: "ch06-the-suq-al-warraqin.md" },
        { number: 7, title: "The Apprentice's Ledger", summary: "Workshop deepening; siyaq accounting; Omar al-Dimashqi teaches finishing; first commercial instinct.", status: "Planned" as const, file: "ch07-the-apprentices-ledger.md" },
        { number: 8, title: "The Tilemaker's Son", summary: "Home chapter; Ali's tile workshop; glaze chemistry; Layla's memory; letter from Omar; rooftop at sunset.", status: "Planned" as const, file: "ch08-the-tilemakers-son.md" },
        { number: 9, title: "The Paper and the Knife", summary: "Difficult government delivery; navigating bureaucracy; Abu Said's Sogdian visitor seeds the Rayy journey.", status: "Planned" as const, file: "ch09-the-paper-and-the-knife.md" },
      ],
    },
    {
      title: "Part II: The Mountain and the Market",
      range: "Chapters 10–19",
      chapters: [
        { number: 10, title: "The Oud Player's Return", summary: "Musa reconnection; Ibrahim al-Mosuli performance; music ambushes Yusuf with emotion.", status: "Planned" as const, file: "ch10-the-oud-players-return.md" },
        { number: 11, title: "The Proposition", summary: "Abu Said proposes the Rayy venture; preparation; Omar al-Dimashqi helps; Musa invited to join.", status: "Planned" as const, file: "ch11-the-proposition.md" },
        { number: 12, title: "The Land of Canals", summary: "Departure through the Khorasan Gate; the Great Khorasan Road; a barid rider; Musa as intelligence asset.", status: "Planned" as const, file: "ch12-the-land-of-canals.md" },
        { number: 13, title: "The World Turns Upward", summary: "Zagros foothills; camels traded for mules; the ascent; a mule slips; Yusuf injures his hand.", status: "Planned" as const, file: "ch13-the-world-turns-upward.md" },
        { number: 14, title: "The Chieftain's Tent", summary: "Badraqa negotiation; mint tea and offers; late snowstorm; two pack animals lost.", status: "Planned" as const, file: "ch14-the-chieftains-tent.md" },
        { number: 15, title: "The Crossroads of Rayy", summary: "Rayy — Silk Road crossroads; successful paper sale; Sogdian suftaja networks; Nestorian merchants.", status: "Planned" as const, file: "ch15-the-crossroads-of-rayy.md" },
        { number: 16, title: "The Musician's Garden", summary: "Quieter chapter; Musa meets a Persian musician; late-night conversation about diverging paths.", status: "Planned" as const, file: "ch16-the-musicians-garden.md" },
        { number: 17, title: "The Descent", summary: "Return through the Zagros; flash flood costs supplies; arrives in Baghdad changed.", status: "Planned" as const, file: "ch17-the-descent.md" },
        { number: 18, title: "The Master's Question", summary: "Abu Said debriefs Rayy; Yusuf describes the suftaja system; Omar al-Dimashqi's new paper grade.", status: "Planned" as const, file: "ch18-the-masters-question.md" },
        { number: 19, title: "The Letter from Omar", summary: "Letter from half-brother Omar; visit to Ali; cobalt tile fragment; grandfather Suleiman seeds planted.", status: "Planned" as const, file: "ch19-the-letter-from-omar.md" },
      ],
    },
    {
      title: "Part III: The Desert, the North, and the Ghost",
      range: "Chapters 20–33",
      chapters: [
        { number: 20, title: "The Western Road", summary: "Departure for Damascus; Abu Said's challenge — sell paper to a papyrus market.", status: "Planned" as const, file: "ch20-the-western-road.md" },
        { number: 21, title: "The Singing Sands", summary: "Desert crossing; sandstorm; water discipline; Musa's Bedouin songs unlock memories of Layla.", status: "Planned" as const, file: "ch21-the-singing-sands.md" },
        { number: 22, title: "The City of Jasmine", summary: "Damascus — jasmine, labyrinthine souks; Umayyad Mosque; the military administration pitch.", status: "Planned" as const, file: "ch22-the-city-of-jasmine.md" },
        { number: 23, title: "The Scribe of Damascus", summary: "Papyrus supplier sabotages Yusuf's pitch; Umar counsels patience; the side door through scholars.", status: "Planned" as const, file: "ch23-the-scribe-of-damascus.md" },
        { number: 24, title: "A Cup of Date Wine", summary: "Evening with Damascus merchants; stories of the Umayyad fall; empires feel permanent from inside.", status: "Planned" as const, file: "ch24-a-cup-of-date-wine.md" },
        { number: 25, title: "The Northern Artery", summary: "Journey to Mosul; the Jazira; honey-coloured alabaster; Syriac speakers and Kurdish traders.", status: "Planned" as const, file: "ch25-the-northern-artery.md" },
        { number: 26, title: "The Monk's Question", summary: "Mosul; Nestorian merchant Isho; Monastery of Saint Matthew; 'Will your paper hold God's word?'; reunion with Omar.", status: "Planned" as const, file: "ch26-the-monks-question.md" },
        { number: 27, title: "The Return and the Restlessness", summary: "Baghdad interlude; workshop too smooth; Abu Said raises the Merv opportunity; Ali gives family names.", status: "Planned" as const, file: "ch27-the-return-and-the-restlessness.md" },
        { number: 28, title: "The Family's Kiln", summary: "Arrival in Merv; a distant cousin weeps; the house where Ali was born; grandfather's kiln.", status: "Planned" as const, file: "ch28-the-familys-kiln.md" },
        { number: 29, title: "The Chess Player", summary: "Paper sale at the governor's court; Bahram negotiates over chess; commerce as culture.", status: "Planned" as const, file: "ch29-the-chess-player.md" },
        { number: 30, title: "The Sogdian's Ghost", summary: "The foundational scene. Dastan destroyed at the auction; the stillness that haunts Yusuf.", status: "Planned" as const, file: "ch30-the-sogdians-ghost.md" },
        { number: 31, title: "The Silk Gamble", summary: "Yusuf uses Abu Said's suftaja to buy the silk; betrayal of trust for personal gain.", status: "Planned" as const, file: "ch31-the-silk-gamble.md" },
        { number: 32, title: "The Long Road Home", summary: "Two caravans; mountain passes, bribes, bandits; arrival in Baghdad; staggered silk sales.", status: "Planned" as const, file: "ch32-the-long-road-home.md" },
        { number: 33, title: "The Reckoning", summary: "Yusuf confesses to Abu Said; devastating speech; apprenticeship ends.", status: "Planned" as const, file: "ch33-the-reckoning.md" },
      ],
    },
    {
      title: "Part IV: The Choice",
      range: "Chapters 34–38",
      chapters: [
        { number: 34, title: "The Inheritance", summary: "Ali reveals the family trust; grandfather Suleiman's legacy; ~6,000 dinars.", status: "Planned" as const, file: "ch34-the-inheritance.md" },
        { number: 35, title: "Paper Is Real", summary: "The central argument; Yusuf's ambition vs Ali's craft; 'Paper is real. You can touch it.'", status: "Planned" as const, file: "ch35-paper-is-real.md" },
        { number: 36, title: "The Partnership", summary: "Omar al-Dimashqi for production; Ishaq bar Yohannan for legal structure; the three pieces assemble.", status: "Planned" as const, file: "ch36-the-partnership.md" },
        { number: 37, title: "The House of Paper", summary: "The founding; premises in Karkh; named The House of Paper; the three founders sit together.", status: "Planned" as const, file: "ch37-the-house-of-paper.md" },
        { number: 38, title: "The Gate at Dawn", summary: "Yusuf on his rooftop; the Khorasan Gate in first light; the pouch of sand unopened; a gate of his own.", status: "Planned" as const, file: "ch38-the-gate-at-dawn.md" },
      ],
    },
    {
      title: "Part V: The Byzantine Education",
      range: "Chapters 39–43",
      chapters: [
        { number: 39, title: "The Edge of the World", summary: "Two years after founding; Constantinople venture; Yonan al-Nasrani hired; the militarised frontier.", status: "Planned" as const, file: "ch39-the-edge-of-the-world.md" },
        { number: 40, title: "The City of Icons", summary: "Constantinople — Hagia Sophia, icons, stone power; paper sells brilliantly; Leo asekretis bleeds his capital.", status: "Planned" as const, file: "ch40-the-city-of-icons.md" },
        { number: 41, title: "Brother Michael", summary: "Near-ruin; Stoudios Monastery; Brother Michael needs better paper; crisis resolved through craft.", status: "Planned" as const, file: "ch41-brother-michael.md" },
        { number: 42, title: "The Banker of Chios", summary: "Demetrios of Chios; Byzantine banking mechanics; the three pillars: Capital, Information, Influence.", status: "Planned" as const, file: "ch42-the-banker-of-chios.md" },
        { number: 43, title: "The Road That Has No End", summary: "The return; the frontier in reverse; the Khorasan Gate facing east; the pouch of sand, still unopened.", status: "Planned" as const, file: "ch43-the-road-that-has-no-end.md" },
      ],
    },
  ],
};

function collectChapterData(nodes: FileNode[]): Map<string, ChapterData> {
  const map = new Map<string, ChapterData>();
  for (const node of nodes) {
    if (node.type === "file" && node.path.startsWith("chapters/book-1/") && node.name.endsWith(".md") && /^ch\d+-/.test(node.name) && !node.path.includes("/briefs/")) {
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
          43 chapters planned &middot; {draftedCount} drafted &middot;{" "}
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
