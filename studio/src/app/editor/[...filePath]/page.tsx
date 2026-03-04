import { Feather } from "lucide-react";

interface EditorPageProps {
  params: Promise<{ filePath: string[] }>;
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { filePath } = await params;
  const path = filePath.join("/");

  return (
    <div className="flex h-full items-center justify-center bg-background">
      <div className="max-w-md px-8 text-center">
        <Feather className="mx-auto h-10 w-10 text-accent" />
        <h1 className="mt-4 font-serif text-2xl font-semibold text-primary">
          Editor
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Editing:{" "}
          <span className="font-medium text-foreground">{path}</span>
        </p>
        <p className="mt-4 text-xs text-sidebar-muted italic">
          The Tiptap editor will be mounted here by the Editor team.
        </p>
      </div>
    </div>
  );
}
