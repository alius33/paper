import { BookOpen } from "lucide-react";

interface ViewerPageProps {
  params: Promise<{ filePath: string[] }>;
}

export default async function ViewerPage({ params }: ViewerPageProps) {
  const { filePath } = await params;
  const path = filePath.join("/");

  return (
    <div className="flex h-full items-center justify-center bg-background">
      <div className="max-w-md px-8 text-center">
        <BookOpen className="mx-auto h-10 w-10 text-accent" />
        <h1 className="mt-4 font-serif text-2xl font-semibold text-primary">
          Viewer
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Viewing:{" "}
          <span className="font-medium text-foreground">{path}</span>
        </p>
        <p className="mt-4 text-xs text-sidebar-muted italic">
          Read-only rendered view will appear here.
        </p>
      </div>
    </div>
  );
}
