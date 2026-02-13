import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";

let AsyncStorage;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch (_e) {
  AsyncStorage = null;
}

const CODEFORCES_STORAGE_KEY = "@arc_codeforces_stats";

export default function CodeforcesPage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState({
    totalSolved: "",
    rating: "",
    rank: "",
    maxRating: "",
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    if (AsyncStorage) {
      try {
        const raw = await AsyncStorage.getItem(CODEFORCES_STORAGE_KEY);
        if (raw) {
          setStats(JSON.parse(raw));
        }
      } catch (_e) {
        // ignore
      }
    }
  };

  const saveStats = useCallback(async () => {
    if (AsyncStorage) {
      try {
        await AsyncStorage.setItem(
          CODEFORCES_STORAGE_KEY,
          JSON.stringify(stats)
        );
      } catch (_e) {
        // ignore
      }
    }
    setIsEditing(false);
  }, [stats]);

  const updateField = (field, value) => {
    setStats((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Codeforces</Text>
          <TouchableOpacity
            onPress={isEditing ? saveStats : () => setIsEditing(true)}
          >
            <Text style={styles.editBtn}>{isEditing ? "Save" : "Edit"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.logoSection}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>🔥</Text>
        </View>
        <Text style={styles.platformName}>Codeforces</Text>
        <Text style={styles.platformSub}>Track your rating progress</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Text style={styles.sectionTitle}>Problems Solved</Text>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Problems Solved</Text>
          {isEditing ? (
            <TextInput
              style={styles.totalInput}
              value={stats.totalSolved}
              onChangeText={(text) => updateField("totalSolved", text)}
              keyboardType="numeric"
              placeholder="0"
            />
          ) : (
            <Text style={styles.totalValue}>{stats.totalSolved || "—"}</Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>Rating & Rank</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Current Rating</Text>
            {isEditing ? (
              <TextInput
                style={styles.statInput}
                value={stats.rating}
                onChangeText={(text) => updateField("rating", text)}
                keyboardType="numeric"
                placeholder="0"
              />
            ) : (
              <Text style={styles.statValue}>{stats.rating || "—"}</Text>
            )}
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Max Rating</Text>
            {isEditing ? (
              <TextInput
                style={styles.statInput}
                value={stats.maxRating}
                onChangeText={(text) => updateField("maxRating", text)}
                keyboardType="numeric"
                placeholder="0"
              />
            ) : (
              <Text style={styles.statValue}>{stats.maxRating || "—"}</Text>
            )}
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Rank</Text>
            {isEditing ? (
              <TextInput
                style={styles.statInput}
                value={stats.rank}
                onChangeText={(text) => updateField("rank", text)}
                keyboardType="numeric"
                placeholder="0"
              />
            ) : (
              <Text style={styles.statValue}>{stats.rank || "—"}</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },

  header: {
    backgroundColor: "#f59e0b",
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    fontSize: 24,
    color: "#fff",
    marginTop: -2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  editBtn: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },

  logoSection: {
    alignItems: "center",
    marginTop: -30,
    marginBottom: 20,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  logoText: {
    fontSize: 36,
  },
  platformName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1f2937",
    marginTop: 12,
  },
  platformSub: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginTop: 24,
    marginBottom: 14,
    color: "#1f2937",
  },

  totalCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 42,
    fontWeight: "700",
    color: "#1f2937",
  },
  totalInput: {
    fontSize: 42,
    fontWeight: "700",
    textAlign: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#f59e0b",
    minWidth: 100,
    padding: 4,
  },

  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1f2937",
  },
  statInput: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#f59e0b",
    minWidth: 80,
    padding: 4,
  },
});
