import { History } from "lucide-react";

interface HistoryPageProps {
  params: Promise<{ filePath: string[] }>;
}

export default async function HistoryPage({ params }: HistoryPageProps) {
  const { filePath } = await params;
  const path = filePath.join("/");

  return (
    <div className="flex h-full items-center justify-center bg-background">
      <div className="max-w-md px-8 text-center">
        <History className="mx-auto h-10 w-10 text-accent" />
        <h1 className="mt-4 font-serif text-2xl font-semibold text-primary">
          History
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          History for:{" "}
          <span className="font-medium text-foreground">{path}</span>
        </p>
        <p className="mt-4 text-xs text-sidebar-muted italic">
          Git log and diff views will appear here.
        </p>
      </div>
    </div>
  );
}
