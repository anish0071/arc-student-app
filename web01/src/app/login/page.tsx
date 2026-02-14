"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ALLOWED_DOMAIN } from "@/lib/auth";
import { getSessionUser } from "@/lib/arcData";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const error = params.get("error");

  React.useEffect(() => {
    const checkSession = async () => {
      const user = await getSessionUser();
      if (user?.email) router.replace("/");
    };
    checkSession();
  }, [router]);

  const handleLogin = async () => {
    const redirectTo = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          hd: ALLOWED_DOMAIN,
          prompt: "select_account",
        },
      },
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>ARC Student Web</p>
        <h1 className={styles.title}>Sign in to continue</h1>
        <p className={styles.subtitle}>
          Use your @{ALLOWED_DOMAIN} Google account to access the portal.
        </p>
        {error === "unauthorized" ? (
          <div className={styles.error}>
            This account is not permitted. Use a student account.
          </div>
        ) : null}
        <button className={styles.primaryBtn} onClick={handleLogin}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
