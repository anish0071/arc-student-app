import React, { useState, useEffect, useCallback, useContext, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Animated } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ThemeContext } from "../lib/theme";
import { useStudent } from "../lib/student-context";
import { usePermissions } from "../lib/permissions-context";
import { useNotifications } from "../lib/notifications-context";
import { supabase } from "../lib/supabase";

const CODECHEF_FIELDS = ['CODECHEF_ID', 'CC_TOTAL_PROBLEMS', 'CC_RANK', 'CC_BADGES', 'CC_RATING'];

// Map display labels to DB field names
const FIELD_LABEL_MAP = {
  'CODECHEF': 'CODECHEF_ID',
  'CODECHEF ID': 'CODECHEF_ID',
  'CC TOTAL': 'CC_TOTAL_PROBLEMS',
  'CC_TOTAL': 'CC_TOTAL_PROBLEMS',
  'CC RANK': 'CC_RANK',
  'CC_RANK': 'CC_RANK',
  'CC BADGES': 'CC_BADGES',
  'CC_BADGES': 'CC_BADGES',
  'CC RATING': 'CC_RATING',
  'CC_RATING': 'CC_RATING',
};

// Reverse map: DB field names to request labels
const DB_TO_LABEL_MAP = {
  CODECHEF_ID: 'CODECHEF ID',
  CC_TOTAL_PROBLEMS: 'CC TOTAL',
  CC_RANK: 'CC RANK',
  CC_BADGES: 'CC BADGES',
  CC_RATING: 'CC RATING',
};

export default function CodeChefPage() {
  const router = useRouter();
  const { highlight } = useLocalSearchParams();
  const { theme, isDark } = useContext(ThemeContext);
  const { studentData, setStudentData } = useStudent();
  const { isFieldEditable, hasAnyEditableField } = usePermissions();
  const { markFieldComplete } = useNotifications();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const [stats, setStats] = useState({
    id: '',
    totalProblems: '',
    rank: '',
    badges: '',
    rating: ''
  });

  // Parse highlight fields from route params
  const highlightFields = React.useMemo(() => {
    if (!highlight) return new Set();
    const fields = String(highlight).split(',').map(f => f.trim().toUpperCase());
    const dbFields = fields.map(f => FIELD_LABEL_MAP[f] || f).filter(Boolean);
    return new Set(dbFields);
  }, [highlight]);

  // Pulse animation for highlighted fields
  useEffect(() => {
    if (highlightFields.size > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: false }),
          Animated.timing(pulseAnim, { toValue: 0, duration: 800, useNativeDriver: false }),
        ])
      ).start();
    }
  }, [highlightFields, pulseAnim]);

  const canEdit = hasAnyEditableField(CODECHEF_FIELDS);

  useEffect(() => {
    if (studentData) {
      setStats({
        id: studentData.CODECHEF_ID || '',
        totalProblems: studentData.CC_TOTAL_PROBLEMS?.toString() || '',
        rank: studentData.CC_RANK?.toString() || '',
        badges: studentData.CC_BADGES?.toString() || '',
        rating: studentData.CC_RATING?.toString() || ''
      });
    }
  }, [studentData]);

  const saveStats = useCallback(async () => {
    try {
      setSaving(true);
      const updates = {};
      const updatedFields = [];

      if (isFieldEditable('CODECHEF_ID')) {
        updates.CODECHEF_ID = stats.id || null;
        if (highlightFields.has('CODECHEF_ID')) updatedFields.push('CODECHEF_ID');
      }
      if (isFieldEditable('CC_TOTAL_PROBLEMS')) {
        updates.CC_TOTAL_PROBLEMS = stats.totalProblems ? parseInt(stats.totalProblems) : null;
        if (highlightFields.has('CC_TOTAL_PROBLEMS')) updatedFields.push('CC_TOTAL_PROBLEMS');
      }
      if (isFieldEditable('CC_RANK')) {
        updates.CC_RANK = stats.rank ? parseInt(stats.rank) : null;
        if (highlightFields.has('CC_RANK')) updatedFields.push('CC_RANK');
      }
      if (isFieldEditable('CC_BADGES')) {
        updates.CC_BADGES = stats.badges ? parseInt(stats.badges) : null;
        if (highlightFields.has('CC_BADGES')) updatedFields.push('CC_BADGES');
      }
      if (isFieldEditable('CC_RATING')) {
        updates.CC_RATING = stats.rating ? parseInt(stats.rating) : null;
        if (highlightFields.has('CC_RATING')) updatedFields.push('CC_RATING');
      }

      const { data, error } = await supabase
        .from('Students')
        .update(updates)
        .eq('OFFICIAL_MAIL', studentData.OFFICIAL_MAIL || studentData.EMAIL || studentData.email)
        .select()
        .single();

      if (error) throw error;

      // Mark highlighted fields as completed
      const section = studentData.SECTION || studentData.section;
      const regNo = studentData.REGNO || studentData.REG_NO || studentData.reg_no;
      for (const dbField of updatedFields) {
        const fieldLabel = DB_TO_LABEL_MAP[dbField] || dbField;
        await markFieldComplete(section, regNo, fieldLabel);
      }
      
      setStudentData(data);
      setIsEditing(false);
      Alert.alert('Success', 'CodeChef stats saved' + (updatedFields.length > 0 ? ` (${updatedFields.length} required field${updatedFields.length > 1 ? 's' : ''} updated)` : ''));
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  }, [stats, studentData, setStudentData, isFieldEditable, highlightFields, markFieldComplete]);

  const updateField = (field, value) => {
    setStats(prev => ({ ...prev, [field]: value }));
  };

  const StatCard = ({ label, value, color, field, dbField }) => {
    const fieldEditable = isFieldEditable(dbField);
    const showAsEditable = isEditing && fieldEditable;
    return (
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
          {!fieldEditable && <Text style={styles.lock}>🔒</Text>}
        </View>
        {showAsEditable ? (
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            value={value}
            onChangeText={(text) => updateField(field, text)}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={theme.textSecondary}
          />
        ) : (
          <Text style={[styles.value, { color }]}>{value || '-'}</Text>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: '#fff' }]}>CodeChef</Text>
          {canEdit ? (
            <TouchableOpacity onPress={isEditing ? saveStats : () => setIsEditing(true)} disabled={saving}>
              <Text style={[styles.editBtn, { color: '#fff' }]}>{saving ? 'Saving...' : isEditing ? 'Save' : 'Edit'}</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>
      </View>

      {/* Logo Section */}
      <View style={styles.logoSection}>
        <View style={[styles.logoCircle, { backgroundColor: theme.secondary }]}>
          <Text style={styles.logoText}>🍴</Text>
        </View>
        <Text style={[styles.platformName, { color: theme.text }]}>CodeChef</Text>
        <Text style={[styles.platformSub, { color: theme.textSecondary }]}>Competitive coding</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Account</Text>
        <View style={[styles.idCard, { backgroundColor: theme.surface }]}>
          <View style={styles.idLabelRow}>
            <Text style={[styles.idLabel, { color: theme.textSecondary }]}>CodeChef ID</Text>
            {!isFieldEditable('CODECHEF_ID') && <Text style={styles.lockIcon}>🔒</Text>}
          </View>
          {isEditing && isFieldEditable('CODECHEF_ID') ? (
            <TextInput
              style={[styles.idInput, { color: theme.text, borderColor: theme.border }]}
              value={stats.id}
              onChangeText={(text) => updateField('id', text)}
              placeholder="username"
              placeholderTextColor={theme.textSecondary}
            />
          ) : (
            <Text style={[styles.idValue, { color: theme.text }]}>{stats.id || '-'}</Text>
          )}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Statistics</Text>
        
        <View style={styles.statsRow}>
          <StatCard label="Problems Solved" value={stats.totalProblems} color={theme.primary} field="totalProblems" dbField="CC_TOTAL_PROBLEMS" />
          <StatCard label="Rating" value={stats.rating} color={theme.secondary} field="rating" dbField="CC_RATING" />
        </View>

        <View style={styles.statsRow}>
          <StatCard label="Rank" value={stats.rank} color={theme.primary} field="rank" dbField="CC_RANK" />
          <StatCard label="Badges" value={stats.badges} color={theme.secondary} field="badges" dbField="CC_BADGES" />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingBottom: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 24, color: '#fff', marginTop: -2 },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  editBtn: { fontSize: 14, fontWeight: '600' },

  logoSection: { alignItems: 'center', marginTop: -30, marginBottom: 20 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  logoText: { fontSize: 40 },
  platformName: { fontSize: 22, fontWeight: '700', marginTop: 12 },
  platformSub: { fontSize: 14, marginTop: 4 },

  content: { flex: 1, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginTop: 24, marginBottom: 14 },

  idCard: { borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  idLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  idLabel: { fontSize: 13, fontWeight: '600' },
  lockIcon: { fontSize: 12 },
  idValue: { fontSize: 16, fontWeight: '700' },
  idInput: { fontSize: 16, fontWeight: '700', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },

  card: { flex: 1, borderRadius: 16, padding: 16, marginHorizontal: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 12, fontWeight: '600' },
  lock: { fontSize: 10 },
  value: { fontSize: 24, fontWeight: '700' },
  input: { fontSize: 20, fontWeight: '700', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },

  statsRow: { flexDirection: 'row', marginBottom: 12 }
});
