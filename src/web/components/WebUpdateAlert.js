import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { ThemeContext } from "../../lib/theme";

const BODY_FONT = Platform.OS === "web" ? "Trebuchet MS" : undefined;
const DISPLAY_FONT = Platform.OS === "web" ? "Georgia" : undefined;

function groupFields(fields) {
  const groupedFields = {
    leetcode: { label: "LeetCode", route: "/leetcode", fields: [] },
    codechef: { label: "CodeChef", route: "/codechef", fields: [] },
    codeforces: { label: "Codeforces", route: "/codeforces", fields: [] },
    skillrack: { label: "Skillrack", route: "/skillrack", fields: [] },
    github: { label: "GitHub", route: "/github", fields: [] },
    linkedin: { label: "LinkedIn", route: "/linkedin", fields: [] },
    resume: { label: "Resume", route: "/resume", fields: [] },
    profile: { label: "Profile", route: "/profile", fields: [] },
  };

  fields.forEach((f) => {
    const label = (f.field_label || f).toUpperCase();
    const fieldName = f.field_label || f;
    if (
      label.includes("LEETCODE") ||
      label.startsWith("LC_") ||
      label.startsWith("LC ")
    ) {
      groupedFields.leetcode.fields.push(fieldName);
    } else if (
      label.includes("CODECHEF") ||
      label.startsWith("CC_") ||
      label.startsWith("CC ")
    ) {
      groupedFields.codechef.fields.push(fieldName);
    } else if (
      label.includes("CODEFORCES") ||
      label.startsWith("CF_") ||
      label.startsWith("CF ")
    ) {
      groupedFields.codeforces.fields.push(fieldName);
    } else if (
      label.includes("SKILLRACK") ||
      label.startsWith("SR_") ||
      label.startsWith("SR ")
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

  return Object.entries(groupedFields).filter(([, g]) => g.fields.length > 0);
}

export default function WebUpdateAlert({ fields = [], onNavigate, onDismiss }) {
  const { theme, isDark } = React.useContext(ThemeContext);
  if (!fields || fields.length === 0) return null;

  const groups = groupFields(fields);
  const total = fields.length;

  const containerBg = isDark ? "#22183f" : "#f6f4ff";
  const border = isDark ? "#3b2a6b" : "#ded6ff";
  const chipBg = isDark ? "#2f2255" : "#ece7ff";
  const chipText = isDark ? "#e9d5ff" : "#4c1d95";

  return (
    <View style={[styles.container, { backgroundColor: containerBg, borderColor: border }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>
            Update Required
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {total} field{total > 1 ? "s" : ""} need your attention
          </Text>
        </View>
        <TouchableOpacity onPress={onDismiss} style={[styles.dismiss, { borderColor: border }]}>
          <Text style={[styles.dismissText, { color: theme.textSecondary }]}>
            Dismiss
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.groupRow}>
        {groups.map(([key, group]) => (
          <TouchableOpacity
            key={key}
            style={[styles.groupCard, { borderColor: border }]}
            onPress={() => onNavigate && onNavigate(group.route, group.fields)}
          >
            <Text style={[styles.groupTitle, { color: theme.text }]}>
              {group.label}
            </Text>
            <Text style={[styles.groupCount, { color: theme.textSecondary }]}>
              {group.fields.length} field{group.fields.length > 1 ? "s" : ""}
            </Text>
            <View style={styles.tags}>
              {group.fields.slice(0, 3).map((f, idx) => (
                <View key={`${key}-${idx}`} style={[styles.tag, { backgroundColor: chipBg }]}>
                  <Text style={[styles.tagText, { color: chipText }]}>{f}</Text>
                </View>
              ))}
              {group.fields.length > 3 ? (
                <View style={[styles.tag, { backgroundColor: chipBg }]}>
                  <Text style={[styles.tagText, { color: chipText }]}>
                    +{group.fields.length - 3} more
                  </Text>
                </View>
              ) : null}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: DISPLAY_FONT,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: BODY_FONT,
  },
  dismiss: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  dismissText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: BODY_FONT,
  },
  groupRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  groupCard: {
    width: "48%",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginRight: "4%",
    marginBottom: 12,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: BODY_FONT,
  },
  groupCount: {
    marginTop: 4,
    fontSize: 11,
    fontFamily: BODY_FONT,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "600",
    fontFamily: BODY_FONT,
  },
});
