"use client";

import React from "react";
import Shell from "@/components/Shell";
import AuthGuard from "@/components/AuthGuard";
import styles from "../portal.module.css";
import { useArcData } from "@/lib/useArcData";

const STORAGE_KEY = "arc_codeforces_stats";
const FIELDS = ["totalSolved", "rating", "rank", "maxRating"];

export default function CodeforcesPage() {
  const [form, setForm] = React.useState<Record<string, any>>({
    totalSolved: "",
    rating: "",
    rank: "",
    maxRating: "",
  });
  const [saving, setSaving] = React.useState(false);
  const { logout } = useArcData();

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setForm(JSON.parse(raw));
    } catch (_e) {
      // ignore
    }
  }, []);

  const handleSave = () => {
    setSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthGuard>
      <Shell title="Codeforces" onLogout={logout}>
        <div className={styles.pageGrid}>
          <div className={styles.card}>
            <div className={styles.sectionTitle}>Codeforces Stats</div>
            <div className={styles.fieldGrid}>
              {FIELDS.map((field) => (
                <label key={field} className={styles.field}>
                  <div className={styles.fieldHeader}>
                    <span className={styles.label}>{field}</span>
                  </div>
                  <input
                    className={styles.input}
                    type="number"
                    inputMode="numeric"
                    value={form[field] ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, [field]: e.target.value }))
                    }
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
      </Shell>
    </AuthGuard>
  );
}
