import { HistoryPageClient } from "./history-page-client";

interface HistoryPageProps {
  params: Promise<{ filePath: string[] }>;
}

export default async function HistoryPage({ params }: HistoryPageProps) {
  const { filePath } = await params;
  const path = filePath.join("/");

  return <HistoryPageClient filePath={path} />;
}
