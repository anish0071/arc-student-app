import { supabase } from "./supabaseClient";

export const ALLOWED_DOMAIN = "citchennai.net";

export function validateOrgEmail(email: string | null | undefined) {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return normalized.endsWith(`@${ALLOWED_DOMAIN}`);
}

export async function fetchUserRole(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return null;
  return data?.role ? String(data.role).toUpperCase() : null;
}
