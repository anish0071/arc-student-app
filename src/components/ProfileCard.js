import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function ProfileCard({ student, onSave }) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState({ ...student });

  useEffect(() => setLocal({ ...student }), [student]);

  function save() {
    setEditing(false);
    onSave && onSave(local);
  }

  const initials = (local.name || "")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials || "ST"}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          {editing ? (
            <TextInput
              style={styles.nameInput}
              value={local.name}
              onChangeText={(t) => setLocal({ ...local, name: t })}
            />
          ) : (
            <Text style={styles.title}>{local.name || "Student"}</Text>
          )}
          <Text style={styles.small}>{local.email || "No email set"}</Text>
        </View>
        <TouchableOpacity
          onPress={() => setEditing((e) => !e)}
          style={styles.editBtn}
        >
          <Text style={styles.editBtnText}>{editing ? "Cancel" : "Edit"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        <View style={styles.col}>
          <Text style={styles.label}>Reg No</Text>
          {editing ? (
            <TextInput
              value={local.regNo}
              onChangeText={(t) => setLocal({ ...local, regNo: t })}
              style={styles.input}
            />
          ) : (
            <Text>{local.regNo || "—"}</Text>
          )}
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Section</Text>
          {editing ? (
            <TextInput
              value={local.section}
              onChangeText={(t) => setLocal({ ...local, section: t })}
              style={styles.input}
            />
          ) : (
            <Text>{local.section || "—"}</Text>
          )}
        </View>
      </View>

      <View style={styles.gridBottom}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Phone</Text>
          {editing ? (
            <TextInput
              value={local.phone}
              onChangeText={(t) => setLocal({ ...local, phone: t })}
              style={styles.input}
            />
          ) : (
            <Text>{local.phone || "—"}</Text>
          )}
        </View>
        <View style={{ width: 110, justifyContent: "flex-end" }}>
          {editing ? (
            <TouchableOpacity onPress={save} style={styles.saveBtn}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  header: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 18 },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    width: "100%",
    paddingHorizontal: 6,
  },
  small: { color: "#666", fontSize: 12, marginTop: 2, textAlign: "center" },
  editBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#eee",
    borderRadius: 8,
  },
  editBtnText: { fontWeight: "600" },
  nameInput: {
    fontSize: 18,
    fontWeight: "700",
    padding: 0,
    textAlign: "center",
  },
  grid: { flexDirection: "row", marginTop: 12 },
  gridBottom: { flexDirection: "row", marginTop: 12, alignItems: "center" },
  col: { flex: 1, marginRight: 8 },
  label: { color: "#666", fontSize: 12, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#eee",
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#fafafa",
  },
  saveBtn: {
    backgroundColor: "#10b981",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "700" },
});
