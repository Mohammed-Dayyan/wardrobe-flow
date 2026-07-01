import { Logo } from "@/components/brand/Logo";
import Link from "next/link";
import { Shirt, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function DashboardWelcome() {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-card shadow-sm">
      <CardContent className="space-y-5 p-5 sm:p-6">
        <div className="space-y-2">
          <h2 className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xl font-semibold tracking-tight">
            <span>Welcome to</span>
            <Logo size="md" />
          </h2>
          <p className="text-sm text-muted-foreground">
            Start by adding a few pieces to your wardrobe, then log your first day to unlock
            insights and history.
          </p>
        </div>

        <ol className="space-y-3 text-sm">
          <li className="flex items-start gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
              1
            </span>
            <span className="pt-0.5 text-muted-foreground">Add tops, pants, jackets, or shoes you own</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
              2
            </span>
            <span className="pt-0.5 text-muted-foreground">Log what kind of day it was</span>
          </li>
        </ol>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            className="h-12 w-full gap-2 text-base sm:h-11 sm:flex-1"
            nativeButton={false}
            render={<Link href="/wardrobe/new" />}
          >
            <Shirt className="size-4" />
            Add clothing
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-12 w-full gap-2 text-base sm:h-11 sm:flex-1"
            nativeButton={false}
            render={<Link href="/outfits/new" />}
          >
            <PlusCircle className="size-4" />
            Log your first day
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
