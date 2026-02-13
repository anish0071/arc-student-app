import React, { useState, useEffect, useCallback, useContext, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Animated } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ThemeContext } from "../lib/theme";
import { useStudent } from "../lib/student-context";
import { usePermissions } from "../lib/permissions-context";
import { useNotifications } from "../lib/notifications-context";
import { supabase } from "../lib/supabase";

const GITHUB_FIELDS = ['GITHUB_ID', 'GITHUB_LINK'];

// Map display labels to DB field names
const FIELD_LABEL_MAP = {
  'GITHUB': 'GITHUB_ID',
  'GITHUB ID': 'GITHUB_ID',
  'GITHUB_ID': 'GITHUB_ID',
  'GITHUB LINK': 'GITHUB_LINK',
  'GITHUB_LINK': 'GITHUB_LINK',
};

// Reverse map: DB field names to request labels
const DB_TO_LABEL_MAP = {
  GITHUB_ID: 'GITHUB ID',
  GITHUB_LINK: 'GITHUB LINK',
};

export default function GitHubPage() {
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
    link: ''
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

  const canEdit = hasAnyEditableField(GITHUB_FIELDS);

  useEffect(() => {
    if (studentData) {
      setStats({
        id: studentData.GITHUB_ID || '',
        link: studentData.GITHUB_LINK || ''
      });
    }
  }, [studentData]);

  const saveStats = useCallback(async () => {
    try {
      setSaving(true);
      const updates = {};
      const updatedFields = [];

      if (isFieldEditable('GITHUB_ID')) {
        updates.GITHUB_ID = stats.id || null;
        if (highlightFields.has('GITHUB_ID')) updatedFields.push('GITHUB_ID');
      }
      if (isFieldEditable('GITHUB_LINK')) {
        updates.GITHUB_LINK = stats.link || null;
        if (highlightFields.has('GITHUB_LINK')) updatedFields.push('GITHUB_LINK');
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
      Alert.alert('Success', 'GitHub profile saved' + (updatedFields.length > 0 ? ` (${updatedFields.length} required field${updatedFields.length > 1 ? 's' : ''} updated)` : ''));
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  }, [stats, studentData, setStudentData, isFieldEditable, highlightFields, markFieldComplete]);

  const updateField = (field, value) => {
    setStats(prev => ({ ...prev, [field]: value }));
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: '#fff' }]}>GitHub</Text>
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
          <Text style={styles.logoText}>💻</Text>
        </View>
        <Text style={[styles.platformName, { color: theme.text }]}>GitHub</Text>
        <Text style={[styles.platformSub, { color: theme.textSecondary }]}>Your coding portfolio</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Profile</Text>
        
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>GitHub Username</Text>
            {!isFieldEditable('GITHUB_ID') && <Text style={styles.lock}>🔒</Text>}
          </View>
          {isEditing && isFieldEditable('GITHUB_ID') ? (
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border }]}
              value={stats.id}
              onChangeText={(text) => updateField('id', text)}
              placeholder="your-username"
              placeholderTextColor={theme.textSecondary}
            />
          ) : (
            <Text style={[styles.value, { color: theme.text }]}>{stats.id || '-'}</Text>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>GitHub Link</Text>
            {!isFieldEditable('GITHUB_LINK') && <Text style={styles.lock}>🔒</Text>}
          </View>
          {isEditing && isFieldEditable('GITHUB_LINK') ? (
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border }]}
              value={stats.link}
              onChangeText={(text) => updateField('link', text)}
              placeholder="https://github.com/your-username"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
            />
          ) : (
            <Text style={[styles.value, { color: theme.text }]}>{stats.link || '-'}</Text>
          )}
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

  card: { borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 13, fontWeight: '600' },
  lock: { fontSize: 12 },
  value: { fontSize: 16, fontWeight: '700' },
  input: { fontSize: 16, fontWeight: '700', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 }
});
