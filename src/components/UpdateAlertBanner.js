import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { ThemeContext } from "../lib/theme";

/**
 * UpdateAlertBanner - A prominent, eye-catching notification banner
 * that displays when the section advisor requests field updates.
 * Styled to match the app's violet/indigo theme with clear light/dark distinction.
 */
export default function UpdateAlertBanner({
  fields = [],
  onDismiss,
  onNavigate,
}) {
  const { theme, isDark } = useContext(ThemeContext);

  if (!fields || fields.length === 0) return null;

  // Group fields by category and map to routes for smart navigation
  const groupedFields = {
    leetcode: { icon: "▶️", label: "LeetCode", route: "/leetcode", fields: [] },
    codechef: { icon: "🍴", label: "CodeChef", route: "/codechef", fields: [] },
    codeforces: {
      icon: "⚔️",
      label: "CodeForces",
      route: "/codeforces",
      fields: [],
    },
    skillrack: {
      icon: "🎯",
      label: "Skillrack",
      route: "/skillrack",
      fields: [],
    },
    github: { icon: "💻", label: "GitHub", route: "/github", fields: [] },
    linkedin: { icon: "🔗", label: "LinkedIn", route: "/linkedin", fields: [] },
    resume: { icon: "📄", label: "Resume", route: "/resume", fields: [] },
    profile: { icon: "👤", label: "Profile", route: "/profile", fields: [] },
  };

  fields.forEach((f) => {
    const label = (f.field_label || f).toUpperCase();
    const fieldName = f.field_label || f;
    // LC = LeetCode, CC = CodeChef, CF = Codeforces, SR = Skillrack
    if (
      label.includes("LEETCODE") ||
      label.startsWith("LC_") ||
      label.startsWith("LC ") ||
      label === "LC TOTAL" ||
      label === "LC RATING" ||
      label === "LC EASY" ||
      label === "LC MED" ||
      label === "LC HARD"
    ) {
      groupedFields.leetcode.fields.push(fieldName);
    } else if (
      label.includes("CODECHEF") ||
      label.startsWith("CC_") ||
      label.startsWith("CC ") ||
      label === "CC TOTAL" ||
      label === "CC RATING" ||
      label === "CC RANK"
    ) {
      groupedFields.codechef.fields.push(fieldName);
    } else if (
      label.includes("CODEFORCES") ||
      label.startsWith("CF_") ||
      label.startsWith("CF ") ||
      label === "CF RATING" ||
      label === "CF RANK"
    ) {
      groupedFields.codeforces.fields.push(fieldName);
    } else if (
      label.includes("SKILLRACK") ||
      label.startsWith("SR_") ||
      label.startsWith("SR ") ||
      label === "SR PROBLEMS" ||
      label === "SR RANK"
    ) {
      groupedFields.skillrack.fields.push(fieldName);
    } else if (label.includes("GITHUB")) {
      groupedFields.github.fields.push(fieldName);
    } else if (label.includes("LINKEDIN")) {
      groupedFields.linkedin.fields.push(fieldName);
    } else if (label.includes("RESUME")) {
      groupedFields.resume.fields.push(fieldName);
    } else {
      groupedFields.profile.fields.push(fieldName);
    }
  });

  // Filter out empty groups
  const activeGroups = Object.entries(groupedFields).filter(
    ([, g]) => g.fields.length > 0
  );
  const totalFields = fields.length;

  // Theme-specific colors
  const colors = isDark
    ? {
        container: "#1e1245",
        containerBorder: "#6d28d9",
        headerBg: "#2e1a5e",
        iconBg: "#4c1d95",
        iconBorder: "#8b5cf6",
        titleColor: "#e9d5ff",
        subtitleColor: "#c4b5fd",
        fieldTag: "#3b2070",
        fieldTagBorder: "#7c3aed",
        fieldTagText: "#ddd6fe",
        buttonBg: "#8b5cf6",
        buttonText: "#fff",
        dismissBg: "rgba(139,92,246,0.3)",
        groupBg: "#251850",
        groupBorder: "#4c1d95",
      }
    : {
        container: "#f5f3ff",
        containerBorder: "#c4b5fd",
        headerBg: "#ede9fe",
        iconBg: "#7c3aed",
        iconBorder: "#a78bfa",
        titleColor: "#5b21b6",
        subtitleColor: "#6b21a8",
        fieldTag: "#e9d5ff",
        fieldTagBorder: "#c4b5fd",
        fieldTagText: "#6b21a8",
        buttonBg: "#7c3aed",
        buttonText: "#fff",
        dismissBg: "rgba(124,58,237,0.15)",
        groupBg: "#ffffff",
        groupBorder: "#e9d5ff",
      };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.container,
          borderColor: colors.containerBorder,
        },
      ]}
    >
      {/* Header Section */}
      <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: colors.iconBg, borderColor: colors.iconBorder },
          ]}
        >
          <Text style={styles.alertIcon}>🔔</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.titleColor }]}>
            Update Required
          </Text>
          <Text style={[styles.subtitle, { color: colors.subtitleColor }]}>
            {totalFields} field{totalFields > 1 ? "s" : ""} need your attention
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.dismissBtn, { backgroundColor: colors.dismissBg }]}
          onPress={onDismiss}
          activeOpacity={0.7}
        >
          <Text style={[styles.dismissBtnText, { color: colors.titleColor }]}>
            ✕
          </Text>
        </TouchableOpacity>
      </View>

      {/* Fields grouped by destination - each group is a clickable button */}
      <ScrollView
        style={styles.groupsScroll}
        contentContainerStyle={styles.groupsContainer}
        showsVerticalScrollIndicator={false}
      >
        {activeGroups.map(([key, group]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.groupCard,
              {
                backgroundColor: colors.groupBg,
                borderColor: colors.groupBorder,
              },
            ]}
            onPress={() => onNavigate && onNavigate(group.route, group.fields)}
            activeOpacity={0.7}
          >
            <View style={styles.groupHeader}>
              <Text style={styles.groupIcon}>{group.icon}</Text>
              <View style={styles.groupInfo}>
                <Text style={[styles.groupLabel, { color: colors.titleColor }]}>
                  {group.label}
                </Text>
                <Text
                  style={[styles.groupCount, { color: colors.subtitleColor }]}
                >
                  {group.fields.length} field
                  {group.fields.length > 1 ? "s" : ""}
                </Text>
              </View>
              <Text
                style={[styles.groupArrow, { color: colors.subtitleColor }]}
              >
                ›
              </Text>
            </View>
            <View style={styles.groupFields}>
              {group.fields.map((field, idx) => (
                <Text
                  key={idx}
                  style={[styles.fieldText, { color: colors.fieldTagText }]}
                  numberOfLines={1}
                >
                  • {field}
                </Text>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
    shadowColor: "#7c3aed",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    marginRight: 12,
  },
  alertIcon: {
    fontSize: 20,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "600",
  },
  dismissBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dismissBtnText: {
    fontSize: 16,
    fontWeight: "700",
  },
  groupsScroll: {
    flexGrow: 0,
  },
  groupsContainer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  groupCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  groupIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  groupInfo: {
    flex: 1,
  },
  groupLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  groupCount: {
    fontSize: 11,
    marginTop: 2,
  },
  groupArrow: {
    fontSize: 24,
    fontWeight: "300",
  },
  groupFields: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(124,58,237,0.2)",
  },
  fieldText: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    flexWrap: "wrap",
    flexShrink: 1,
  },
});
