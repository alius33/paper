import { BookOpen, Feather, ScrollText, FolderOpen } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="max-w-lg px-8 text-center">
        {/* Title */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-primary">
            Paper House Studio
          </h1>
          <div className="mt-2 h-px w-24 mx-auto bg-accent" />
          <p className="mt-4 font-serif text-lg italic text-muted-foreground">
            Manuscript management for The House of Paper
          </p>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          A writing studio for managing chapters, research, and revisions
          across a four-book historical fiction series set in the Abbasid
          Caliphate, 770&ndash;814 CE.
        </p>

        {/* Feature cards */}
        <div className="mt-10 grid grid-cols-2 gap-4">
          <FeatureCard
            icon={<Feather className="h-5 w-5" />}
            title="Write"
            description="Rich text editor with autosave"
          />
          <FeatureCard
            icon={<FolderOpen className="h-5 w-5" />}
            title="Organize"
            description="Browse chapters and research"
          />
          <FeatureCard
            icon={<ScrollText className="h-5 w-5" />}
            title="Research"
            description="Reference materials at hand"
          />
          <FeatureCard
            icon={<BookOpen className="h-5 w-5" />}
            title="Revise"
            description="Version history and diffs"
          />
        </div>

        {/* Subtle footer */}
        <p className="mt-12 text-xs text-sidebar-muted">
          Select a file from the sidebar to begin.
        </p>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-accent">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <span className="text-sm font-semibold">{title}</span>
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
