import React, { useEffect } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { supabase } from "../../src/lib/supabase";

const ALLOWED_DOMAIN = "citchennai.net";

// Validate that email belongs to the organization domain
const validateOrgEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  const normalizedEmail = email.toLowerCase().trim();
  return normalizedEmail.endsWith(`@${ALLOWED_DOMAIN}`);
};

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const handleAuthCallback = async () => {
      try {
        const url = await Linking.getInitialURL();
        if (!url) {
          router.replace("/login");
          return;
        }

        // Let Supabase handle everything
        const { data, error } = await supabase.auth.exchangeCodeForSession(url);

        if (error) {
          console.warn(error.message);
          router.replace("/login");
          return;
        }

        if (!mounted) return;

        const user = data?.session?.user;
        if (!user) {
          router.replace("/login");
          return;
        }

        // Domain validation
        if (!validateOrgEmail(user.email)) {
          await supabase.auth.signOut();
          Alert.alert(
            "Access Denied",
            `Only @${ALLOWED_DOMAIN} email addresses are allowed.`,
            [{ text: "OK", onPress: () => router.replace("/login") }],
          );
          return;
        }

        // ✅ SUCCESS ROUTE
        router.replace("/student");
      } catch (e) {
        console.warn("Auth callback error:", e);
        router.replace("/login");
      }
    };

    handleAuthCallback();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View style={styles.root}>
      <Text style={styles.text}>Signing you in…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 16,
    color: "#6b7280",
  },
});
