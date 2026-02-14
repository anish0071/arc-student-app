import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter, usePathname } from "expo-router";
import { ThemeContext } from "../../lib/theme";

const BODY_FONT = Platform.OS === "web" ? "Trebuchet MS" : undefined;
const DISPLAY_FONT = Platform.OS === "web" ? "Georgia" : undefined;

const NAV_SECTIONS = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", route: "/student" },
      { label: "Profile", route: "/profile" },
    ],
  },
  {
    title: "Coding Platforms",
    items: [
      { label: "LeetCode", route: "/leetcode" },
      { label: "Skillrack", route: "/skillrack" },
      { label: "CodeChef", route: "/codechef" },
      { label: "Codeforces", route: "/codeforces" },
    ],
  },
  {
    title: "Profiles & Docs",
    items: [
      { label: "GitHub", route: "/github" },
      { label: "LinkedIn", route: "/linkedin" },
      { label: "Resume", route: "/resume" },
    ],
  },
];

export default function WebShell({
  title,
  children,
  onLogout,
  onToggleTheme,
  isDark,
  student,
}) {
  const { theme } = React.useContext(ThemeContext);
  const router = useRouter();
  const pathname = usePathname();

  const initials = (student?.NAME || "ST")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <View style={[styles.sidebar, { backgroundColor: theme.surface }]}>
        <View style={styles.brand}>
          <Text style={[styles.brandText, { color: theme.text }]}>ARC</Text>
          <Text style={[styles.brandSub, { color: theme.textSecondary }]}>
            Student Portal
          </Text>
        </View>

        <View style={[styles.userCard, { borderColor: theme.border }]}>
          <View
            style={[
              styles.userAvatar,
              { backgroundColor: theme.primary },
            ]}
          >
            <Text style={styles.userAvatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.userName, { color: theme.text }]}>
              {student?.NAME || "Student"}
            </Text>
            <Text style={[styles.userMeta, { color: theme.textSecondary }]}>
              {student?.SECTION || student?.sec || "-"} â€¢{" "}
              {student?.DEPT || "-"}
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.nav}
          contentContainerStyle={styles.navContent}
          showsVerticalScrollIndicator={false}
        >
          {NAV_SECTIONS.map((section) => (
            <View key={section.title} style={styles.navSection}>
              <Text style={[styles.navTitle, { color: theme.textSecondary }]}>
                {section.title}
              </Text>
              {section.items.map((item) => {
                const active = pathname === item.route;
                return (
                  <TouchableOpacity
                    key={item.route}
                    onPress={() => router.push(item.route)}
                    style={[
                      styles.navItem,
                      active && {
                        backgroundColor: theme.surfaceAlt,
                        borderColor: theme.primary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.navItemText,
                        { color: theme.text },
                        active && { color: theme.primary },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </ScrollView>

        <View style={[styles.sidebarFooter, { borderColor: theme.border }]}>
          <TouchableOpacity
            onPress={onToggleTheme}
            style={[styles.footerBtn, { borderColor: theme.border }]}
          >
            <Text style={[styles.footerBtnText, { color: theme.text }]}>
              {isDark ? "Light Mode" : "Dark Mode"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onLogout}
            style={[styles.logoutBtn, { borderColor: theme.border }]}
          >
            <Text style={[styles.logoutText, { color: theme.text }]}>
              Log out
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.main}>
        <View style={[styles.topbar, { borderColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          <View style={styles.topbarRight}>
            <View
              style={[
                styles.themePill,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,0,0,0.04)",
                },
              ]}
            >
              <Text style={[styles.themeText, { color: theme.textSecondary }]}>
                {isDark ? "Night" : "Day"}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentInner}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: "row",
    minHeight: "100%",
  },
  sidebar: {
    width: 280,
    paddingHorizontal: 22,
    paddingVertical: 24,
    borderRightWidth: 1,
  },
  brand: {
    marginBottom: 22,
  },
  brandText: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 1.2,
    fontFamily: DISPLAY_FONT,
  },
  brandSub: {
    marginTop: 4,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
    fontFamily: BODY_FONT,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 18,
  },
  userAvatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  userAvatarText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: BODY_FONT,
  },
  userMeta: {
    fontSize: 11,
    marginTop: 2,
    fontFamily: BODY_FONT,
  },
  nav: {
    flex: 1,
  },
  navContent: {
    paddingBottom: 12,
  },
  navSection: {
    marginBottom: 18,
  },
  navTitle: {
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8,
    fontFamily: BODY_FONT,
  },
  navItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
    marginBottom: 6,
  },
  navItemText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: BODY_FONT,
  },
  sidebarFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
  },
  footerBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  footerBtnText: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    fontFamily: BODY_FONT,
  },
  logoutBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    fontFamily: BODY_FONT,
  },
  main: {
    flex: 1,
  },
  topbar: {
    height: 72,
    paddingHorizontal: 32,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: DISPLAY_FONT,
  },
  topbarRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  themePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  themeText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: BODY_FONT,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    paddingHorizontal: 32,
    paddingVertical: 28,
  },
});
