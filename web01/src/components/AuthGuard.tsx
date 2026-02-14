"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useArcData } from "@/lib/useArcData";
import styles from "./auth-guard.module.css";

type Props = {
  children: React.ReactNode;
};

export default function AuthGuard({ children }: Props) {
  const router = useRouter();
  const { status } = useArcData();

  React.useEffect(() => {
    if (status === "unauth") {
      router.replace("/login");
    }
    if (status === "unauthorized") {
      router.replace("/login?error=unauthorized");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className={styles.loading}>
        <div className={styles.card}>Loading your dashboard...</div>
      </div>
    );
  }

  if (status !== "ready") return null;
  return <>{children}</>;
}
