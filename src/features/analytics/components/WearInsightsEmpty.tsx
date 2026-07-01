import Link from "next/link";
import type { WearEmptyMessage } from "@/features/analytics/lib/wear-insights-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WearInsightsEmptyProps {
  message: WearEmptyMessage;
}

export function WearInsightsEmpty({ message }: WearInsightsEmptyProps) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">{message.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{message.description}</p>
        {message.showHistoryLink ? (
          <Button
            nativeButton={false}
            variant="outline"
            size="sm"
            render={<Link href="/history" />}
          >
            View history
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
