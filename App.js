import React, { useState, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  Button,
  StyleSheet,
  RefreshControl,
} from "react-native";
import ProfileCard from "./src/components/ProfileCard";
import PendingUpdatesList from "./src/components/PendingUpdatesList";
import FieldSummaryList from "./src/components/FieldSummaryList";
import FieldHistoryModal from "./src/components/FieldHistoryModal";

export default function App() {
  const [student, setStudent] = useState({
    name: "Alice Example",
    regNo: "2025-001",
    section: "A",
    email: "alice@example.com",
    phone: "+1-555-0100",
  });
  const [pending, setPending] = useState([
    {
      id: "p1",
      label: "Emergency Contact",
      type: "text",
      value: "",
      help: "Provide emergency contact name",
      required: true,
      status: "New",
    },
    {
      id: "p2",
      label: "Phone",
      type: "number",
      value: "",
      help: "Update phone if changed",
      required: false,
      status: "Needs refresh",
    },
  ]);
  const [fields, setFields] = useState([
    { id: "p1", label: "Emergency Contact", lastValue: "", lastUpdated: null },
    { id: "p2", label: "Phone", lastValue: student.phone, lastUpdated: null },
  ]);
  const [historyMap, setHistoryMap] = useState({});
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyFor, setHistoryFor] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // TODO: Replace the timeout with real reload logic (re-fetch user/profile data)
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  function saveProfile(updated) {
    setStudent(updated);
  }

  function handleSaveField(fieldId, value) {
    // mark field as updated and add to history
    setPending((p) => p.filter((x) => x.id !== fieldId));
    setFields((f) =>
      f.map((i) =>
        i.id === fieldId
          ? { ...i, lastValue: value, lastUpdated: new Date().toISOString() }
          : i
      )
    );
    setHistoryMap((h) => ({
      ...h,
      [fieldId]: [
        ...(h[fieldId] || []),
        { date: new Date().toLocaleString(), value },
      ],
    }));
  }

  function openHistory(fieldId) {
    setHistoryFor(fieldId);
    setHistoryOpen(true);
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.header}>ARC</Text>
      <ProfileCard student={student} onSave={saveProfile} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pending updates</Text>
        <PendingUpdatesList pending={pending} onSave={handleSaveField} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All fields</Text>
        <FieldSummaryList fields={fields} onViewHistory={openHistory} />
      </View>

      <FieldHistoryModal
        visible={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={historyMap[historyFor]}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#f4f6f8" },
  header: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  section: { marginTop: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
});
