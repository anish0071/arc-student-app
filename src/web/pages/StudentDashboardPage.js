import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";
import { ThemeContext } from "../../lib/theme";
import { useStudent } from "../../lib/student-context";
import { usePermissions } from "../../lib/permissions-context";
import { useNotifications } from "../../lib/notifications-context";
import { supabase } from "../../lib/supabase";
import WebShell from "../components/WebShell";
import WebUpdateAlert from "../components/WebUpdateAlert";

const BODY_FONT = Platform.OS === "web" ? "Trebuchet MS" : undefined;
const DISPLAY_FONT = Platform.OS === "web" ? "Georgia" : undefined;

export default function StudentDashboardWeb() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = React.useContext(ThemeContext);
  const { studentData, clearStudentData, reloadStudentData } = useStudent();
  const { refreshPermissions } = usePermissions();
  const { notifications, fetchNotifications, dismissAll } = useNotifications();

  const student = studentData || {};

  React.useEffect(() => {
    if (student.SECTION) {
      const regNo = student.REG_NO || student.reg_no || student.REGNO;
      fetchNotifications(student.SECTION, regNo);
    }
  }, [student.SECTION, student.REG_NO, student.reg_no, student.REGNO, fetchNotifications]);

  const handleLogout = async () => {
    let AsyncStorage;
    try {
      AsyncStorage = require("@react-native-async-storage/async-storage").default;
    } catch (_e) {
      AsyncStorage = null;
    }

    try {
      await supabase.auth.signOut();
    } finally {
      if (AsyncStorage) {
        try {
          await AsyncStorage.removeItem("@arc_user");
        } catch (_e) {
          // ignore
        }
      }
      clearStudentData();
      router.replace("/login");
    }
  };

  const handleRefresh = async () => {
    const regNo = student.REG_NO || student.reg_no || student.REGNO;
    await Promise.all([
      reloadStudentData(),
      refreshPermissions(),
      student.SECTION ? fetchNotifications(student.SECTION, regNo) : Promise.resolve(),
    ]);
  };

  const statCards = [
    {
      label: "LeetCode",
      value: student.LC_TOTAL_PROBLEMS ? `${student.LC_TOTAL_PROBLEMS}` : "-",
      meta: "Problems solved",
      route: "/leetcode",
      accent: theme.primary,
    },
    {
      label: "Skillrack",
      value: student.SR_PROBLEMS_SOLVED ? `${student.SR_PROBLEMS_SOLVED}` : "-",
      meta: "Problems solved",
      route: "/skillrack",
      accent: theme.secondary,
    },
    {
      label: "CodeChef",
      value: student.CC_RATING ? `${student.CC_RATING}` : "-",
      meta: "Rating",
      route: "/codechef",
      accent: theme.primaryDark,
    },
    {
      label: "GitHub",
      value: student.GITHUB_ID || "-",
      meta: "Username",
      route: "/github",
      accent: theme.text,
    },
    {
      label: "LinkedIn",
      value: student.LINKEDIN_URL ? "Linked" : "-",
      meta: "Profile",
      route: "/linkedin",
      accent: theme.text,
    },
    {
      label: "Resume",
      value: student.RESUME_LINK ? "Linked" : "-",
      meta: "Document",
      route: "/resume",
      accent: theme.text,
    },
  ];

  return (
    <WebShell
      title="Dashboard"
      onLogout={handleLogout}
      onToggleTheme={toggleTheme}
      isDark={isDark}
      student={student}
    >
      <View style={[styles.hero, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.heroTitle, { color: theme.text }]}>
            Welcome back{student.NAME ? `, ${student.NAME.split(" ")[0]}` : ""}.
          </Text>
          <Text style={[styles.heroSub, { color: theme.textSecondary }]}>
            Keep your profile and coding stats fresh for placements and advisor reviews.
          </Text>
          <View style={styles.heroActions}>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
              onPress={() => router.push("/profile")}
            >
              <Text style={styles.primaryBtnText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryBtn, { borderColor: theme.border }]}
              onPress={handleRefresh}
            >
              <Text style={[styles.secondaryBtnText, { color: theme.text }]}>
                Refresh Data
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={[styles.heroPanel, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
          <Text style={[styles.panelLabel, { color: theme.textSecondary }]}>Section</Text>
          <Text style={[styles.panelValue, { color: theme.text }]}>
            {student.SECTION || student.sec || "-"}
          </Text>
          <Text style={[styles.panelLabel, { color: theme.textSecondary }]}>Reg No</Text>
          <Text style={[styles.panelValue, { color: theme.text }]}>
            {student.REGNO || student.REG_NO || student.reg_no || "-"}
          </Text>
        </View>
      </View>

      <WebUpdateAlert
        fields={notifications}
        onDismiss={dismissAll}
        onNavigate={(route, requiredFields) => {
          const params =
            requiredFields && requiredFields.length > 0
              ? { highlight: requiredFields.join(",") }
              : {};
          router.push({ pathname: route, params });
        }}
      />

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Overview</Text>
      <View style={styles.statsGrid}>
        {statCards.map((card) => (
          <TouchableOpacity
            key={card.label}
            style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => router.push(card.route)}
          >
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{card.label}</Text>
            <Text style={[styles.statValue, { color: card.accent }]}>{card.value}</Text>
            <Text style={[styles.statMeta, { color: theme.textSecondary }]}>{card.meta}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </WebShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 24,
    flexDirection: "row",
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: DISPLAY_FONT,
  },
  heroSub: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    maxWidth: 520,
    fontFamily: BODY_FONT,
  },
  heroActions: {
    flexDirection: "row",
    marginTop: 16,
  },
  primaryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 10,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    fontFamily: BODY_FONT,
  },
  secondaryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: "700",
    fontFamily: BODY_FONT,
  },
  heroPanel: {
    width: 200,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginLeft: 20,
  },
  panelLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
    fontFamily: BODY_FONT,
  },
  panelValue: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    fontFamily: DISPLAY_FONT,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    fontFamily: DISPLAY_FONT,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "32%",
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  statLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontFamily: BODY_FONT,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 10,
    fontFamily: DISPLAY_FONT,
  },
  statMeta: {
    fontSize: 12,
    marginTop: 6,
    fontFamily: BODY_FONT,
  },
});
