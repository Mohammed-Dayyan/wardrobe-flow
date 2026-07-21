// Hand-maintained types. Regenerate from Supabase when the schema changes:
// npx supabase gen types typescript --project-id <id> > src/types/database.generated.ts
export type ClothingCategory = "top" | "pants" | "jacket" | "shoes";

export type DayType = "office" | "stay_home" | "travel" | "day_out";

export type OutfitItemRole = "top" | "pants" | "jacket" | "shoes";

export interface Profile {
  id: string;
  email: string;
  display_name: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface ClothingItem {
  id: string;
  user_id: string;
  name: string;
  category: ClothingCategory;
  color: string;
  notes: string | null;
  image_url: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Outfit {
  id: string;
  user_id: string;
  date: string;
  day_type: DayType;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OutfitItem {
  id: string;
  outfit_id: string;
  clothing_item_id: string;
  role: OutfitItemRole;
}

export interface WearHistory {
  id: string;
  user_id: string;
  clothing_item_id: string;
  outfit_id: string;
  worn_date: string;
  created_at: string;
}

export interface ItemWearHistoryEntry {
  id: string;
  worn_date: string;
  outfit_id: string;
  day_type: DayType;
}

export interface ItemWearHistory {
  item: ClothingItem;
  entries: ItemWearHistoryEntry[];
  wear_count: number;
  last_worn_date: string | null;
  has_more: boolean;
}

export type ClothingItemInsert = Omit<
  ClothingItem,
  "id" | "created_at" | "updated_at"
> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type ClothingItemUpdate = Partial<
  Omit<ClothingItem, "id" | "user_id" | "created_at">
>;

export interface ItemWearStat {
  id: string;
  name: string;
  category: ClothingCategory;
  color: string;
  wear_count: number;
  last_worn_date: string | null;
  wears_this_month: number;
}

export interface DayTypeBreakdownRow {
  day_type: DayType;
  count: number;
}
