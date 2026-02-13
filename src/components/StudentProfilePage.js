import React, {
  useEffect,
  useState,
  useContext,
  useRef,
  useCallback,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Keyboard,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { ThemeContext } from "../lib/theme";
import { useStudent } from "../lib/student-context";
import { usePermissions } from "../lib/permissions-context";
import { supabase } from "../lib/supabase";

// List of all profile fields for permission checking
const ALL_PROFILE_FIELDS = [
  "NAME",
  "REGNO",
  "DEPT",
  "SECTION",
  "YEAR",
  "GENDER",
  "EMAIL",
  "OFFICIAL_MAIL",
  "MOBILE_NO",
  "ALT_MOBILE_NO",
  "CURRENT_ADDRESS",
  "PERMANENT_ADDRESS",
  "PINCODE",
  "STATE",
  "10TH_BOARD_MARKS",
  "10TH_BOARD_PCT",
  "10TH_BOARD_YEAR",
  "12TH_BOARD_MARKS",
  "12TH_BOARD_PCT",
  "12TH_BOARD_YEAR",
  "DIPLOMA_YEAR",
  "DIPLOMA_PCT",
  "GPA_SEM1",
  "GPA_SEM2",
  "GPA_SEM3",
  "GPA_SEM4",
  "GPA_SEM5",
  "GPA_SEM6",
  "GPA_SEM7",
  "GPA_SEM8",
  "CGPA",
  "AADHAR_NO",
  "PAN_NO",
  "FATHER_NAME",
  "MOTHER_NAME",
  "GUARDIAN_NAME",
  "KNOWN_TECH_STACK",
  "INTERNSHIP_COMPANY",
  "INTERNSHIP_OFFER_LINK",
  "PLACEMENT_HS",
  "WILLING_TO_RELOCATE",
  "COE_NAME",
  "COE_INCHARGE_NAME",
  "COE_PROJECTS_DONE",
];

export default function StudentProfilePage() {
  const router = useRouter();
  const { theme } = useContext(ThemeContext);
  const { studentData, setStudentData, reloadStudentData } = useStudent();
  const { refreshPermissions } = usePermissions();
  const {
    isFieldEditable,
    hasAnyEditableField,
    loading: permissionsLoading,
  } = usePermissions();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const pendingEditsRef = useRef({});
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([reloadStudentData(), refreshPermissions()]);
    } catch (e) {
      // ignore
    } finally {
      setRefreshing(false);
    }
  }, [reloadStudentData, refreshPermissions]);

  // Check if any field is editable (to show/hide Edit button)
  const canEdit = hasAnyEditableField(ALL_PROFILE_FIELDS);

  useEffect(() => {
    if (studentData) {
      setFormData(studentData);
    }
  }, [studentData]);

  const saveProfile = async () => {
    try {
      setSaving(true);

      // Ensure the currently-focused field commits its value (we sync parent state onBlur).
      Keyboard.dismiss();
      await new Promise((r) => setTimeout(r, 50));

      // Only include fields that are editable in the update
      const editableUpdates = {};
      const norm = (v) => (v === null || v === undefined ? "" : String(v));
      const snapshot = {
        ...formData,
        ...(pendingEditsRef.current || {}),
      };

      Object.keys(snapshot).forEach((field) => {
        if (!isFieldEditable(field)) return;

        // Only send changed values to avoid "success" when nothing actually changed.
        const before = norm(studentData ? studentData[field] : undefined);
        const after = norm(snapshot[field]);
        if (before !== after) {
          editableUpdates[field] = snapshot[field];
        }
      });

      if (Object.keys(editableUpdates).length === 0) {
        Alert.alert("Nothing to save", "No editable fields were changed.");
        setSaving(false);
        return;
      }

      const targetEmail =
        (studentData &&
          (studentData.OFFICIAL_MAIL ||
            studentData.EMAIL ||
            studentData.email)) ||
        null;

      // Prefer updating by primary key `id` when available — more reliable than matching on email.
      const pk = studentData && (studentData.id || studentData.ID || null);

      let query = supabase.from("Students").update(editableUpdates);
      if (pk) {
        query = query.eq("id", pk);
      } else if (targetEmail) {
        query = query.eq("OFFICIAL_MAIL", String(targetEmail).trim());
      } else {
        Alert.alert("Error", "Cannot determine student record to update.");
        setSaving(false);
        return;
      }

      const { data, error } = await query.select();

      if (error) throw error;

      // No rows updated (empty array or null) -> likely mismatch or permission issue
      if (!data || (Array.isArray(data) && data.length === 0)) {
        if (__DEV__) {
          Alert.alert(
            "Update failed",
            "No rows were updated. Check ID/OFFICIAL_MAIL match or RLS permissions."
          );
        } else {
          Alert.alert("Error", "Unable to update profile. Contact admin.");
        }
        setSaving(false);
        return;
      }

      // Use first returned row when update returns an array
      const updatedRow = Array.isArray(data) ? data[0] : data;

      setStudentData(updatedRow);
      pendingEditsRef.current = {};
      setIsEditing(false);
      Alert.alert("Success", "Profile updated");
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const setPendingEdit = (field, value) => {
    pendingEditsRef.current = {
      ...(pendingEditsRef.current || {}),
      [field]: value,
    };
  };

  const EditableField = ({ label, field, keyboardType = "default" }) => {
    const fieldEditable = isFieldEditable(field);
    const showAsEditable = isEditing && fieldEditable;

    // Local state to avoid frequent parent re-renders stealing focus.
    const [localValue, setLocalValue] = React.useState(
      formData[field] != null ? String(formData[field]) : ""
    );

    React.useEffect(() => {
      // Keep localValue in sync when the underlying formData changes from outside.
      setLocalValue(formData[field] != null ? String(formData[field]) : "");
    }, [formData[field]]);

    return (
      <View style={[styles.detailCard, { backgroundColor: theme.surface }]}>
        <View style={styles.labelRow}>
          <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
            {label}
          </Text>
          {!fieldEditable && (
            <Text style={[styles.lockIcon, { color: theme.textSecondary }]}>
              🔒
            </Text>
          )}
        </View>
        {showAsEditable ? (
          <TextInput
            style={[
              styles.detailInput,
              { color: theme.text, borderColor: theme.border },
            ]}
            value={localValue}
            onChangeText={(text) => {
              setLocalValue(text);
              setPendingEdit(field, text);
            }}
            onBlur={() => {
              updateField(field, localValue);
              if (
                pendingEditsRef.current &&
                Object.prototype.hasOwnProperty.call(
                  pendingEditsRef.current,
                  field
                )
              ) {
                const next = { ...(pendingEditsRef.current || {}) };
                delete next[field];
                pendingEditsRef.current = next;
              }
            }}
            keyboardType={keyboardType}
            placeholder="-"
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="none"
          />
        ) : (
          <Text style={[styles.detailValue, { color: theme.text }]}>
            {formData[field] || "-"}
          </Text>
        )}
      </View>
    );
  };

  const initials = (formData.NAME || "ST")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: "#fff" }]}>
            My Profile
          </Text>
          {canEdit ? (
            <TouchableOpacity
              onPress={isEditing ? saveProfile : () => setIsEditing(true)}
              disabled={saving}
            >
              <Text style={[styles.editBtn, { color: "#fff" }]}>
                {saving ? "Saving..." : isEditing ? "Save" : "Edit"}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>
      </View>

      <View style={styles.logoSection}>
        <View style={[styles.logoCircle, { backgroundColor: theme.secondary }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={[styles.platformName, { color: theme.text }]}>
          {formData.NAME || "-"}
        </Text>
        <Text style={[styles.platformSub, { color: theme.textSecondary }]}>
          {formData.SECTION || formData.sec || "-"} • {formData.DEPT || "-"}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Basic Details
        </Text>
        <EditableField label="Full Name" field="NAME" />
        <EditableField label="Registration No" field="REGNO" />
        <EditableField label="Department" field="DEPT" />
        <EditableField label="Section" field="SECTION" />
        <EditableField label="Year" field="YEAR" />
        <EditableField label="Gender" field="GENDER" />

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Contact Information
        </Text>
        <EditableField
          label="Email"
          field="EMAIL"
          keyboardType="email-address"
        />
        <EditableField
          label="Official Email"
          field="OFFICIAL_MAIL"
          keyboardType="email-address"
        />
        <EditableField
          label="Mobile No"
          field="MOBILE_NO"
          keyboardType="phone-pad"
        />
        <EditableField
          label="Alt Mobile No"
          field="ALT_MOBILE_NO"
          keyboardType="phone-pad"
        />
        <EditableField label="Current Address" field="CURRENT_ADDRESS" />
        <EditableField label="Permanent Address" field="PERMANENT_ADDRESS" />
        <EditableField label="Pincode" field="PINCODE" keyboardType="numeric" />
        <EditableField label="State" field="STATE" />

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Educational Details
        </Text>
        <EditableField
          label="10th Board Marks"
          field="10TH_BOARD_MARKS"
          keyboardType="decimal-pad"
        />
        <EditableField
          label="10th Board %"
          field="10TH_BOARD_PCT"
          keyboardType="decimal-pad"
        />
        <EditableField
          label="10th Board Year"
          field="10TH_BOARD_YEAR"
          keyboardType="numeric"
        />
        <EditableField
          label="12th Board Marks"
          field="12TH_BOARD_MARKS"
          keyboardType="decimal-pad"
        />
        <EditableField
          label="12th Board %"
          field="12TH_BOARD_PCT"
          keyboardType="decimal-pad"
        />
        <EditableField
          label="12th Board Year"
          field="12TH_BOARD_YEAR"
          keyboardType="numeric"
        />
        <EditableField
          label="Diploma Year"
          field="DIPLOMA_YEAR"
          keyboardType="numeric"
        />
        <EditableField
          label="Diploma %"
          field="DIPLOMA_PCT"
          keyboardType="decimal-pad"
        />

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          GPA / CGPA
        </Text>
        <EditableField
          label="GPA Sem 1"
          field="GPA_SEM1"
          keyboardType="decimal-pad"
        />
        <EditableField
          label="GPA Sem 2"
          field="GPA_SEM2"
          keyboardType="decimal-pad"
        />
        <EditableField
          label="GPA Sem 3"
          field="GPA_SEM3"
          keyboardType="decimal-pad"
        />
        <EditableField
          label="GPA Sem 4"
          field="GPA_SEM4"
          keyboardType="decimal-pad"
        />
        <EditableField
          label="GPA Sem 5"
          field="GPA_SEM5"
          keyboardType="decimal-pad"
        />
        <EditableField
          label="GPA Sem 6"
          field="GPA_SEM6"
          keyboardType="decimal-pad"
        />
        <EditableField
          label="GPA Sem 7"
          field="GPA_SEM7"
          keyboardType="decimal-pad"
        />
        <EditableField
          label="GPA Sem 8"
          field="GPA_SEM8"
          keyboardType="decimal-pad"
        />
        <EditableField label="CGPA" field="CGPA" keyboardType="decimal-pad" />

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Identification
        </Text>
        <EditableField label="Aadhar No" field="AADHAR_NO" />
        <EditableField label="PAN No" field="PAN_NO" />

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Family Details
        </Text>
        <EditableField label="Father Name" field="FATHER_NAME" />
        <EditableField label="Mother Name" field="MOTHER_NAME" />
        <EditableField label="Guardian Name" field="GUARDIAN_NAME" />

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Skills & Experience
        </Text>
        <EditableField label="Known Tech Stack" field="KNOWN_TECH_STACK" />
        <EditableField label="Internship Company" field="INTERNSHIP_COMPANY" />
        <EditableField
          label="Internship Offer Link"
          field="INTERNSHIP_OFFER_LINK"
        />

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Career Information
        </Text>
        <EditableField
          label="Placement / Higher Studies"
          field="PLACEMENT_HS"
        />
        <EditableField
          label="Willing to Relocate"
          field="WILLING_TO_RELOCATE"
        />

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          COE / Certificates
        </Text>
        <EditableField label="COE Name" field="COE_NAME" />
        <EditableField label="COE Incharge Name" field="COE_INCHARGE_NAME" />
        <EditableField
          label="COE Projects Done"
          field="COE_PROJECTS_DONE"
          keyboardType="numeric"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 52,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: { fontSize: 26, color: "#fff", marginTop: -2 },
  headerTitle: { fontSize: 16, fontWeight: "800", letterSpacing: 0.5 },
  editBtn: { fontSize: 13, fontWeight: "700", letterSpacing: 0.4 },

  logoSection: { alignItems: "center", marginTop: -34, marginBottom: 24 },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#fff",
    shadowColor: "#7c3aed",
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 6,
  },
  avatarText: { color: "#fff", fontWeight: "800", fontSize: 34 },
  platformName: {
    fontSize: 24,
    fontWeight: "800",
    marginTop: 14,
    letterSpacing: 0.3,
    textAlign: "center",
    width: "100%",
    paddingHorizontal: 8,
  },
  platformSub: {
    fontSize: 13,
    marginTop: 6,
    letterSpacing: 0.4,
    textAlign: "center",
  },

  content: { flex: 1, paddingHorizontal: 20 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    marginTop: 28,
    marginBottom: 14,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    opacity: 0.6,
  },

  detailCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#7c3aed",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    opacity: 0.5,
  },
  lockIcon: { fontSize: 12 },
  detailValue: { fontSize: 16, fontWeight: "700" },
  detailInput: {
    fontSize: 16,
    fontWeight: "700",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
});
