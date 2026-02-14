"use client";

import React from "react";
import Shell from "@/components/Shell";
import AuthGuard from "@/components/AuthGuard";
import { useSearchParams } from "next/navigation";
import { useArcData } from "@/lib/useArcData";
import styles from "../portal.module.css";

const FIELDS = [
  "CODECHEF_ID",
  "CC_TOTAL_PROBLEMS",
  "CC_RANK",
  "CC_BADGES",
  "CC_RATING",
];

const INPUT_TYPES: Record<string, string> = {
  CODECHEF_ID: "text",
  CC_TOTAL_PROBLEMS: "number",
  CC_RANK: "number",
  CC_BADGES: "number",
  CC_RATING: "number",
};

export default function CodeChefPage() {
  const params = useSearchParams();
  const highlight = params.get("highlight");
  const highlightFields = new Set(
    (highlight || "")
      .split(",")
      .map((f) => f.trim().toUpperCase())
      .filter(Boolean)
  );

  const { student, permissions, updateStudent, markFieldComplete, logout } =
    useArcData();
  const [form, setForm] = React.useState<Record<string, any>>({});
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (student) {
      const next: Record<string, any> = {};
      FIELDS.forEach((f) => (next[f] = student[f] ?? ""));
      setForm(next);
    }
  }, [student]);

  const canEdit = (field: string) => Boolean(permissions[field]?.editable);

  const handleSave = async () => {
    if (!student) return;
    setSaving(true);
    const updates: Record<string, any> = {};
    FIELDS.forEach((f) => {
      if (!canEdit(f)) return;
      if (form[f] !== student[f]) updates[f] = form[f] || null;
    });
    if (Object.keys(updates).length > 0) {
      await updateStudent(updates);
      for (const f of Object.keys(updates)) {
        if (highlightFields.has(f)) await markFieldComplete(f);
      }
    }
    setSaving(false);
  };

  const initials = (student?.NAME || "ST")
    .split(" ")
    .map((s: string) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const meta = student
    ? `${student.SECTION || student.sec || "-"} - ${student.DEPT || "-"}`
    : "Section -";

  return (
    <AuthGuard>
      <Shell
        title="CodeChef"
        user={{ name: student?.NAME, meta, initials }}
        onLogout={logout}
      >
        {!student ? (
          <div className={styles.card}>
            <div className={styles.sectionTitle}>No student record</div>
            <p>
              Your account is signed in but not linked to a student record.
              Contact the admin/placement office to link your official mail.
            </p>
          </div>
        ) : (
          <div className={styles.pageGrid}>
            <div className={styles.card}>
              <div className={styles.sectionTitle}>CodeChef Stats</div>
              <div className={styles.fieldGrid}>
                {FIELDS.map((field) => (
                <label key={field} className={styles.field}>
                  <div className={styles.fieldHeader}>
                    <span className={styles.label}>{field}</span>
                    {!canEdit(field) ? (
                      <span className={styles.lock}>Locked</span>
                    ) : null}
                    {highlightFields.has(field) ? (
                      <span className={styles.pill}>Required</span>
                    ) : null}
                  </div>
                  <input
                    className={`${styles.input} ${
                      highlightFields.has(field) ? styles.inputHighlight : ""
                    }`}
                    type={INPUT_TYPES[field] || "text"}
                    inputMode={
                      INPUT_TYPES[field] === "number" ? "numeric" : undefined
                    }
                    value={form[field] ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, [field]: e.target.value }))
                    }
                    disabled={!canEdit(field)}
                  />
                </label>
              ))}
            </div>
              <div className={styles.actions}>
                <button className={styles.primaryBtn} onClick={handleSave}>
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </Shell>
    </AuthGuard>
  );
}
