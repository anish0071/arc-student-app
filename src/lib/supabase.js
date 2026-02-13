import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://nlmyljfqacdzrhrjauxx.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sbXlsamZxYWNkenJocmphdXh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MjAwMjIsImV4cCI6MjA4MjI5NjAyMn0.2eAYs4CJWKiCaFFjwCyXTAWUK4AR6anrVXNVOAv6vmQ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Mark a field as updated by the student
export async function markFieldUpdated(section, regNo, fieldLabel) {
  try {
    const normalizedSection = (section || "").toString().trim().toUpperCase();
    const normalizedRegNo = (regNo || "").toString().trim();
    
    console.log("[markFieldUpdated] section:", normalizedSection, "regNo:", normalizedRegNo, "fieldLabel:", fieldLabel);

    const { error } = await supabase.from("field_update_completions").upsert(
      {
        section: normalizedSection,
        reg_no: normalizedRegNo,
        field_label: fieldLabel,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "section,reg_no,field_label" }
    );

    if (error) {
      console.log("[markFieldUpdated] error:", error);
      throw error;
    }
    console.log("[markFieldUpdated] success");
    return { success: true };
  } catch (err) {
    console.warn("markFieldUpdated failed:", err?.message ?? err);
    return { success: false, error: err };
  }
}

// Mark all required fields as updated by the student
export async function markAllFieldsUpdated(section, regNo, fieldLabels) {
  try {
    const normalizedSection = (section || "").toString().trim().toUpperCase();
    const normalizedRegNo = (regNo || "").toString().trim();

    const rows = fieldLabels.map((label) => ({
      section: normalizedSection,
      reg_no: normalizedRegNo,
      field_label: label,
      completed_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("field_update_completions")
      .upsert(rows, {
        onConflict: "section,reg_no,field_label",
      });

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.warn("markAllFieldsUpdated failed:", err?.message ?? err);
    return { success: false, error: err };
  }
}

// Check which fields the student has already marked as complete
export async function fetchCompletedFields(section, regNo) {
  try {
    const normalizedSection = (section || "").toString().trim().toUpperCase();
    const normalizedRegNo = (regNo || "").toString().trim();

    const { data, error } = await supabase
      .from("field_update_completions")
      .select("field_label")
      .ilike("section", normalizedSection)
      .ilike("reg_no", normalizedRegNo);

    if (error) throw error;
    return Array.isArray(data) ? data.map((r) => r.field_label) : [];
  } catch (err) {
    console.warn("fetchCompletedFields failed:", err?.message ?? err);
    return [];
  }
}
