import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function ResumeCard({ resume }) {
  if (!resume) return null;
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Resume</Text>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{resume.name}</Text>
          <Text style={styles.meta}>
            {resume.college} • {resume.place}
          </Text>
        </View>
        {resume.url ? (
          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.link}>Open</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginVertical: 8,
  },
  title: { fontWeight: "700", marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center" },
  name: {
    fontWeight: "700",
    textAlign: "center",
    width: "100%",
    paddingHorizontal: 6,
  },
  meta: { color: "#666", fontSize: 12, marginTop: 4, textAlign: "center" },
  link: { color: "#2563eb", fontWeight: "700" },
});
