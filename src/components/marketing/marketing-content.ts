import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Briefcase,
  CalendarDays,
  Clock,
  History,
  PlusCircle,
  Repeat,
  Shield,
  Shirt,
  Sparkles,
} from "lucide-react";
import type { DayType } from "@/types/database";

export const HERO = {
  eyebrow: "Personal wardrobe tracking",
  headline: "Log what you wore",
  headlineAccent: "in seconds.",
  subcopy:
    "Track daily outfits, manage your wardrobe, and spot repeats - for office, home, travel, and days out.",
} as const;

export const TRUST_PILLS = [
  { icon: Clock, label: "Under 10 seconds a day" },
  { icon: Sparkles, label: "4 day types" },
  { icon: Shield, label: "Private by default" },
] as const;

export const DAY_TYPE_EXAMPLES: Record<DayType, string> = {
  office: "Client meeting",
  stay_home: "Work from home",
  travel: "Flight day",
  day_out: "Weekend brunch",
};

export const DAY_TYPE_SHOWCASE = {
  title: "Built for every kind of day",
  subcopy:
    "Log what matters for the context you're in - not every day looks the same.",
} as const;

export const HOW_IT_WORKS = {
  title: "How it works",
  subcopy: "Three steps from empty wardrobe to useful insights.",
  steps: [
    {
      icon: Shirt,
      title: "Add your wardrobe",
      description: "Catalog tops, pants, jackets, and shoes you actually own.",
    },
    {
      icon: PlusCircle,
      title: "Log today's outfit",
      description: "Pick a day type and select what you wore - done in seconds.",
    },
    {
      icon: BarChart3,
      title: "Review history & insights",
      description: "Browse your calendar, track streaks, and see most-worn items.",
    },
  ],
} as const;

export const FEATURES = {
  title: "Everything you need, nothing you don't",
  subcopy:
    "Fast daily logging, clear history, and wardrobe insights - without the clutter.",
  items: [
    {
      icon: CalendarDays,
      title: "Daily outfit logging",
      description:
        "Log what you wore today with day type and clothing items in a few taps.",
    },
    {
      icon: Briefcase,
      title: "Day-type contexts",
      description:
        "Office, stay home, travel, or day out - track the right wardrobe for each.",
    },
    {
      icon: Repeat,
      title: "Repetition warnings",
      description:
        "See when you last wore an item before you pick it. Helpful hints, never blocking.",
    },
    {
      icon: Shirt,
      title: "Wardrobe inventory",
      description:
        "Build your catalog with color and category - know exactly what you own.",
    },
    {
      icon: History,
      title: "History calendar",
      description:
        "Scroll through past days, see what you logged, and jump to any date.",
    },
    {
      icon: BarChart3,
      title: "Wear analytics",
      description:
        "Discover most-worn items, day-type breakdowns, and monthly trends.",
    },
  ] satisfies ReadonlyArray<{
    icon: LucideIcon;
    title: string;
    description: string;
  }>,
} as const;

export const CTA = {
  title: "Start logging smarter outfits today",
  subcopy: "Free to use · Your data stays private",
} as const;

export const PRODUCT_PREVIEW = {
  greeting: "Good morning, Alex",
  date: "1 July",
  logLabel: "Today's log",
  streak: "2-day streak",
  items: [
    { role: "top" as const, name: "Blue Oxford", color: "#3B82F6" },
    { role: "pants" as const, name: "Charcoal chinos", color: "#374151" },
    { role: "shoes" as const, name: "White sneakers", color: "#F8FAFC" },
  ],
} as const;
