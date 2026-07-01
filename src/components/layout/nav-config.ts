import {
  LayoutDashboard,
  Shirt,
  PlusCircle,
  History,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  matchPrefix?: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/wardrobe",
    label: "Wardrobe",
    icon: Shirt,
    matchPrefix: "/wardrobe",
  },
  {
    href: "/outfits/new",
    label: "Log Outfit",
    icon: PlusCircle,
    matchPrefix: "/outfits",
  },
  {
    href: "/history",
    label: "History",
    icon: History,
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: BarChart3,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

export function getPageTitle(pathname: string): string {
  const item = NAV_ITEMS.find(
    (nav) =>
      nav.href === pathname ||
      (nav.matchPrefix && pathname.startsWith(nav.matchPrefix)),
  );
  return item?.label ?? "WardrobeFlow";
}
