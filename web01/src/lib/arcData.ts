import { supabase } from "./supabaseClient";

export type StudentRow = Record<string, any>;

export async function getSessionUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user || null;
}

export async function fetchStudentByEmail(email: string) {
  const normalized = String(email).trim().toLowerCase();
  const { data, error } = await supabase
    .from("Students")
    .select("*")
    .eq("OFFICIAL_MAIL", normalized)
    .maybeSingle();
  if (!error && data) return data;

  const { data: fallback } = await supabase
    .from("Students")
    .select("*")
    .eq("EMAIL", normalized)
    .maybeSingle();
  return fallback || null;
}

export async function fetchPermissions() {
  const { data, error } = await supabase.from("field_permissions").select("*");
  if (error || !data) return {};
  const map: Record<string, { editable: boolean; category?: string }> = {};
  data.forEach((p: any) => {
    map[p.field_name] = {
      editable: Boolean(p.editable),
      category: p.category || "general",
    };
  });
  return map;
}

export async function fetchNotifications(section: string) {
  if (!section) return [];
  const normalized = String(section).trim().toUpperCase();
  const { data, error } = await supabase
    .from("field_update_requests")
    .select("*")
    .ilike("section", normalized);
  if (error || !data) return [];
  return data;
}

export async function fetchCompletedFields(section: string, regNo: string) {
  if (!section || !regNo) return [];
  const normalizedSection = String(section).trim().toUpperCase();
  const normalizedRegNo = String(regNo).trim();
  const { data, error } = await supabase
    .from("field_update_completions")
    .select("field_label")
    .ilike("section", normalizedSection)
    .ilike("reg_no", normalizedRegNo);
  if (error || !data) return [];
  return data.map((r: any) => String(r.field_label || "").toUpperCase());
}

export async function markFieldUpdated(section: string, regNo: string, fieldLabel: string) {
  const normalizedSection = (section || "").toString().trim().toUpperCase();
  const normalizedRegNo = (regNo || "").toString().trim();
  const { error } = await supabase.from("field_update_completions").upsert(
    {
      section: normalizedSection,
      reg_no: normalizedRegNo,
      field_label: fieldLabel,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "section,reg_no,field_label" }
  );
  if (error) throw error;
  return true;
}
