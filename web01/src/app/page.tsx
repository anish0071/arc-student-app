"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Shell from "@/components/Shell";
import styles from "./page.module.css";
import AuthGuard from "@/components/AuthGuard";
import { useArcData } from "@/lib/useArcData";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const router = useRouter();
  const { student, notifications, reload, dismissAll } = useArcData();

  const routeForField = (label: string) => {
    const key = label.toUpperCase();
    if (key.includes("LEETCODE") || key.startsWith("LC_")) return "/leetcode";
    if (key.includes("CODECHEF") || key.startsWith("CC_")) return "/codechef";
    if (key.includes("CODEFORCES") || key.startsWith("CF_"))
      return "/codeforces";
    if (key.includes("SKILLRACK") || key.startsWith("SR_"))
      return "/skillrack";
    if (key.includes("GITHUB")) return "/github";
    if (key.includes("LINKEDIN")) return "/linkedin";
    if (key.includes("RESUME")) return "/resume";
    return "/profile";
  };

  const userMeta = student
    ? `${student.SECTION || student.sec || "-"} - ${student.DEPT || "-"}`
    : "Section -";
  const initials = (student?.NAME || "ST")
    .split(" ")
    .map((s: string) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const statCards = [
    {
      label: "LeetCode",
      value: student?.LC_TOTAL_PROBLEMS
        ? String(student.LC_TOTAL_PROBLEMS)
        : "-",
      meta: "Solved problems",
    },
    {
      label: "Skillrack",
      value: student?.SR_PROBLEMS_SOLVED
        ? String(student.SR_PROBLEMS_SOLVED)
        : "-",
      meta: "Solved problems",
    },
    {
      label: "CodeChef",
      value: student?.CC_RATING ? String(student.CC_RATING) : "-",
      meta: "Rating",
    },
    {
      label: "GitHub",
      value: student?.GITHUB_ID || "-",
      meta: "Username",
    },
    {
      label: "LinkedIn",
      value: student?.LINKEDIN_URL ? "Linked" : "-",
      meta: "Profile",
    },
    {
      label: "Resume",
      value: student?.RESUME_LINK ? "Linked" : "-",
      meta: "Document",
    },
  ];

  return (
    <AuthGuard>
      <Shell
        title="Dashboard"
        user={{ name: student?.NAME, meta: userMeta, initials }}
        onLogout={handleLogout}
      >
        {!student ? (
          <div className={styles.authShell}>
            <div className={styles.authCard}>
              <h1>Student record missing</h1>
              <p>
                Your account is signed in but not linked to a student record.
                Contact the admin/placement office to link your official mail.
              </p>
            </div>
          </div>
        ) : (
          <div className={styles.grid}>
        <section className={styles.hero}>
          <div>
            <p className={styles.heroEyebrow}>Placement season dashboard</p>
            <h2 className={styles.heroTitle}>
              Keep your academic and coding profile current.
            </h2>
            <p className={styles.heroBody}>
              Review advisor requests, refresh your stats, and stay ready for
              recruiter shortlisting with a single consolidated profile.
            </p>
            <div className={styles.heroActions}>
              <button
                className={styles.primaryBtn}
                onClick={() => router.push("/profile")}
              >
                Edit Profile
              </button>
              <button className={styles.secondaryBtn} onClick={reload}>
                Refresh Data
              </button>
            </div>
          </div>
          <div className={styles.heroPanel}>
            <div>
              <p className={styles.panelLabel}>Section</p>
              <p className={styles.panelValue}>
                {student.SECTION || student.sec || "-"}
              </p>
            </div>
            <div>
              <p className={styles.panelLabel}>Reg No</p>
              <p className={styles.panelValue}>
                {student.REGNO || student.REG_NO || student.reg_no || "-"}
              </p>
            </div>
            <div>
              <p className={styles.panelLabel}>Department</p>
              <p className={styles.panelValue}>{student.DEPT || "-"}</p>
            </div>
          </div>
        </section>

        <section className={styles.alertCard}>
          <div>
            <h3>Update required</h3>
            <p>
              {notifications.length} field
              {notifications.length === 1 ? "" : "s"} need your attention
              before advisor review.
            </p>
          </div>
          <div className={styles.alertList}>
            {notifications.length === 0 ? (
              <div className={styles.alertEmpty}>All caught up.</div>
            ) : (
              notifications.map((item) => (
                <a
                  key={item.id}
                  href={routeForField(item.field_label || "")}
                  className={styles.alertItem}
                >
                  <span>{item.field_label || "Field update"}</span>
                  <span className={styles.alertArrow}>-&gt;</span>
                </a>
              ))
            )}
          </div>
          {notifications.length > 0 ? (
            <button className={styles.ghostBtn} onClick={dismissAll}>
              Dismiss all
            </button>
          ) : null}
        </section>

        <section className={styles.statsSection}>
          <h3>Overview</h3>
          <div className={styles.statsGrid}>
            {statCards.map((card) => (
              <div key={card.label} className={styles.statCard}>
                <p className={styles.statLabel}>{card.label}</p>
                <p className={styles.statValue}>{card.value}</p>
                <p className={styles.statMeta}>{card.meta}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.activity}>
          <div className={styles.activityHeader}>
            <h3>Recent advisor requests</h3>
            <button className={styles.ghostBtn}>View all</button>
          </div>
          <div className={styles.activityList}>
            {notifications.length === 0 ? (
              <div className={styles.activityRow}>
                <div>
                  <p className={styles.activityTitle}>No pending requests</p>
                  <p className={styles.activityMeta}>
                    Your advisor has no updates for you right now.
                  </p>
                </div>
                <span className={styles.activityStatus}>Clear</span>
              </div>
            ) : (
              notifications.slice(0, 3).map((item) => (
                <div key={item.id} className={styles.activityRow}>
                  <div>
                    <p className={styles.activityTitle}>
                      Update {item.field_label || "field"}
                    </p>
                    <p className={styles.activityMeta}>
                      Requested by advisor
                    </p>
                  </div>
                  <span className={styles.activityStatus}>Pending</span>
                </div>
              ))
            )}
          </div>
        </section>
          </div>
        )}
      </Shell>
    </AuthGuard>
  );
}
