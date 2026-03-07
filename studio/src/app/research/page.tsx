"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export default function ResearchPage() {
  const setActiveView = useAppStore((s) => s.setActiveView);
  const router = useRouter();
  useEffect(() => {
    setActiveView("research");
    router.replace("/");
  }, [setActiveView, router]);
  return null;
}
