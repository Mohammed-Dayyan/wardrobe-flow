"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type HistoryViewMode = "timeline" | "calendar";

interface HistoryViewTabsProps {
  view: HistoryViewMode;
}

export function HistoryViewTabs({ view }: HistoryViewTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const setView = useCallback(
    (nextView: HistoryViewMode) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("view", nextView);
      if (nextView === "timeline") {
        params.delete("month");
      } else {
        params.delete("page");
      }
      params.delete("date");

      startTransition(() => {
        router.push(`/history?${params.toString()}`);
      });
    },
    [router, searchParams],
  );

  return (
    <Tabs
      value={view}
      onValueChange={(value) => setView(value as HistoryViewMode)}
      className={cn(isPending && "opacity-70")}
    >
      <TabsList className="h-11 w-full p-1">
        <TabsTrigger value="timeline" className="h-full flex-1 text-sm font-medium">
          Timeline
        </TabsTrigger>
        <TabsTrigger value="calendar" className="h-full flex-1 text-sm font-medium">
          Calendar
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
