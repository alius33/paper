import { Search } from "lucide-react";

export default function SearchPage() {
  return (
    <div className="flex h-full items-center justify-center bg-background">
      <div className="max-w-md px-8 text-center">
        <Search className="mx-auto h-10 w-10 text-accent" />
        <h1 className="mt-4 font-serif text-2xl font-semibold text-primary">
          Search
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Search across chapters, research, and notes.
        </p>
        <p className="mt-4 text-xs text-sidebar-muted italic">
          Full-text search will be implemented here.
        </p>
      </div>
    </div>
  );
}
