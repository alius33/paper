import { Suspense } from "react";
import SearchPageContent from "./search-content";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center bg-background">
          <p className="text-sm text-muted-foreground">Loading search...</p>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
