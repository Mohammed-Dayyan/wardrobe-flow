import type { User } from "@supabase/supabase-js";

export function hasPasswordIdentity(user: User): boolean {
  return user.identities?.some((identity) => identity.provider === "email") ?? false;
}
