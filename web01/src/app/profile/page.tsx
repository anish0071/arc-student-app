"use client";

import React from "react";
import Shell from "@/components/Shell";
import AuthGuard from "@/components/AuthGuard";
import { useSearchParams } from "next/navigation";
import { useArcData } from "@/lib/useArcData";
import styles from "../portal.module.css";

const PROFILE_FIELDS = [
  "NAME",
  "REGNO",
  "DEPT",
  "SECTION",
  "YEAR",
  "GENDER",
  "EMAIL",
  "OFFICIAL_MAIL",
  "MOBILE_NO",
  "ALT_MOBILE_NO",
  "CURRENT_ADDRESS",
  "PERMANENT_ADDRESS",
  "PINCODE",
  "STATE",
  "10TH_BOARD_MARKS",
  "10TH_BOARD_PCT",
  "10TH_BOARD_YEAR",
  "12TH_BOARD_MARKS",
  "12TH_BOARD_PCT",
  "12TH_BOARD_YEAR",
  "DIPLOMA_YEAR",
  "DIPLOMA_PCT",
  "GPA_SEM1",
  "GPA_SEM2",
  "GPA_SEM3",
  "GPA_SEM4",
  "GPA_SEM5",
  "GPA_SEM6",
  "GPA_SEM7",
  "GPA_SEM8",
  "CGPA",
  "AADHAR_NO",
  "PAN_NO",
  "FATHER_NAME",
  "MOTHER_NAME",
  "GUARDIAN_NAME",
  "KNOWN_TECH_STACK",
  "INTERNSHIP_COMPANY",
  "INTERNSHIP_OFFER_LINK",
  "PLACEMENT_HS",
  "WILLING_TO_RELOCATE",
  "COE_NAME",
  "COE_INCHARGE_NAME",
  "COE_PROJECTS_DONE",
];

const SECTIONS: { title: string; fields: string[] }[] = [
  {
    title: "Basic Details",
    fields: ["NAME", "REGNO", "DEPT", "SECTION", "YEAR", "GENDER"],
  },
  {
    title: "Contact Information",
    fields: [
      "EMAIL",
      "OFFICIAL_MAIL",
      "MOBILE_NO",
      "ALT_MOBILE_NO",
      "CURRENT_ADDRESS",
      "PERMANENT_ADDRESS",
      "PINCODE",
      "STATE",
    ],
  },
  {
    title: "Educational Details",
    fields: [
      "10TH_BOARD_MARKS",
      "10TH_BOARD_PCT",
      "10TH_BOARD_YEAR",
      "12TH_BOARD_MARKS",
      "12TH_BOARD_PCT",
      "12TH_BOARD_YEAR",
      "DIPLOMA_YEAR",
      "DIPLOMA_PCT",
    ],
  },
  {
    title: "GPA / CGPA",
    fields: [
      "GPA_SEM1",
      "GPA_SEM2",
      "GPA_SEM3",
      "GPA_SEM4",
      "GPA_SEM5",
      "GPA_SEM6",
      "GPA_SEM7",
      "GPA_SEM8",
      "CGPA",
    ],
  },
  {
    title: "Identification",
    fields: ["AADHAR_NO", "PAN_NO"],
  },
  {
    title: "Family Details",
    fields: ["FATHER_NAME", "MOTHER_NAME", "GUARDIAN_NAME"],
  },
  {
    title: "Skills & Experience",
    fields: ["KNOWN_TECH_STACK", "INTERNSHIP_COMPANY", "INTERNSHIP_OFFER_LINK"],
  },
  {
    title: "Career Information",
    fields: ["PLACEMENT_HS", "WILLING_TO_RELOCATE"],
  },
  {
    title: "COE / Certificates",
    fields: ["COE_NAME", "COE_INCHARGE_NAME", "COE_PROJECTS_DONE"],
  },
];

const INPUT_TYPES: Record<string, string> = {
  EMAIL: "email",
  OFFICIAL_MAIL: "email",
  MOBILE_NO: "tel",
  ALT_MOBILE_NO: "tel",
  PINCODE: "number",
  "10TH_BOARD_MARKS": "number",
  "10TH_BOARD_PCT": "number",
  "10TH_BOARD_YEAR": "number",
  "12TH_BOARD_MARKS": "number",
  "12TH_BOARD_PCT": "number",
  "12TH_BOARD_YEAR": "number",
  DIPLOMA_YEAR: "number",
  DIPLOMA_PCT: "number",
  GPA_SEM1: "number",
  GPA_SEM2: "number",
  GPA_SEM3: "number",
  GPA_SEM4: "number",
  GPA_SEM5: "number",
  GPA_SEM6: "number",
  GPA_SEM7: "number",
  GPA_SEM8: "number",
  CGPA: "number",
  COE_PROJECTS_DONE: "number",
  INTERNSHIP_OFFER_LINK: "url",
};

export default function ProfilePage() {
  const params = useSearchParams();
  const highlight = params.get("highlight");
  const highlightFields = new Set(
    (highlight || "")
      .split(",")
      .map((f) => f.trim().toUpperCase())
      .filter(Boolean)
  );

  const { student, permissions, updateStudent, logout } = useArcData();
  const [form, setForm] = React.useState<Record<string, any>>({});
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (student) setForm(student);
  }, [student]);

  const canEdit = (field: string) => Boolean(permissions[field]?.editable);
  const inputType = (field: string) => INPUT_TYPES[field] || "text";

  const handleSave = async () => {
    if (!student) return;
    setSaving(true);
    const updates: Record<string, any> = {};
    PROFILE_FIELDS.forEach((f) => {
      if (!canEdit(f)) return;
      if (form[f] !== student[f]) updates[f] = form[f];
    });
    if (Object.keys(updates).length > 0) {
      await updateStudent(updates);
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
        title="Profile"
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
            {SECTIONS.map((section) => (
              <div key={section.title} className={styles.card}>
                <div className={styles.sectionTitle}>{section.title}</div>
                <div className={styles.fieldGrid}>
                  {section.fields.map((field) => (
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
                        type={inputType(field)}
                        inputMode={inputType(field) === "number" ? "numeric" : undefined}
                        value={form[field] ?? ""}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            [field]: e.target.value,
                          }))
                        }
                        disabled={!canEdit(field)}
                      />
                    </label>
                  ))}
                </div>
                {section.title === "COE / Certificates" ? (
                  <div className={styles.actions}>
                    <button className={styles.primaryBtn} onClick={handleSave}>
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Shell>
    </AuthGuard>
  );
}
