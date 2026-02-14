"use client";

import React from "react";
import { usePathname } from "next/navigation";
import styles from "./shell.module.css";

type ShellProps = {
  title: string;
  children: React.ReactNode;
  user?: {
    name?: string;
    meta?: string;
    initials?: string;
  };
  onLogout?: () => void;
};

const navSections = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/" },
      { label: "Profile", href: "/profile" },
    ],
  },
  {
    title: "Coding Platforms",
    items: [
      { label: "LeetCode", href: "/leetcode" },
      { label: "Skillrack", href: "/skillrack" },
      { label: "CodeChef", href: "/codechef" },
      { label: "Codeforces", href: "/codeforces" },
    ],
  },
  {
    title: "Profiles & Docs",
    items: [
      { label: "GitHub", href: "/github" },
      { label: "LinkedIn", href: "/linkedin" },
      { label: "Resume", href: "/resume" },
    ],
  },
];

export default function Shell({ title, children, user, onLogout }: ShellProps) {
  const pathname = usePathname();
  const initials = user?.initials || "AR";
  const name = user?.name || "Student";
  const meta = user?.meta || "Section A - CSE";
  const [navOpen, setNavOpen] = React.useState(false);

  const closeNav = () => setNavOpen(false);
  const toggleNav = () => setNavOpen((v) => !v);

  React.useEffect(() => {
    if (typeof document === "undefined") return;
    if (navOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [navOpen]);

  return (
    <div className={styles.shell}>
      <aside
        className={`${styles.sidebar} ${navOpen ? styles.sidebarOpen : ""}`}
      >
        <div className={styles.brand}>
          <div className={styles.brandMark}>ARC</div>
          <p className={styles.brandSub}>Student Web</p>
        </div>

        <div className={styles.profileCard}>
          <div className={styles.avatar}>{initials}</div>
          <div>
            <p className={styles.profileName}>{name}</p>
            <p className={styles.profileMeta}>{meta}</p>
          </div>
        </div>

        <nav className={styles.nav}>
          {navSections.map((section) => (
            <div key={section.title} className={styles.navSection}>
              <p className={styles.navTitle}>{section.title}</p>
              <div className={styles.navList}>
                {section.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
                      onClick={closeNav}
                    >
                      {item.label}
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.ghostBtn}>Switch Theme</button>
          <button
            className={styles.logoutBtn}
            onClick={onLogout}
            disabled={!onLogout}
          >
            Log out
          </button>
        </div>
      </aside>

      {navOpen ? (
        <button
          className={styles.backdrop}
          onClick={closeNav}
          aria-label="Close navigation"
        />
      ) : null}

      <main className={styles.main}>
        <header className={styles.topbar}>
          <button
            className={styles.mobileToggle}
            onClick={toggleNav}
            aria-label="Toggle navigation"
          >
            {navOpen ? "←" : "☰"}
          </button>
          <h1 className={styles.pageTitle}>{title}</h1>
          <div className={styles.topbarActions}>
            <div className={styles.statusPill}>Live - Connected</div>
          </div>
        </header>
        <section className={styles.content}>{children}</section>
      </main>
    </div>
  );
}
