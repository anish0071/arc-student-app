import { useCallback, useEffect, useState } from "react";
import {
  fetchCompletedFields,
  fetchNotifications,
  fetchPermissions,
  fetchStudentByEmail,
  getSessionUser,
  markFieldUpdated,
} from "./arcData";
import { fetchUserRole, validateOrgEmail } from "./auth";
import { supabase } from "./supabaseClient";

type Status = "loading" | "unauth" | "unauthorized" | "ready";

export function useArcData() {
  const [status, setStatus] = useState<Status>("loading");
  const [student, setStudent] = useState<any | null>(null);
  const [permissions, setPermissions] = useState<Record<string, any>>({});
  const [notifications, setNotifications] = useState<any[]>([]);
  const [completedFields, setCompletedFields] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const load = useCallback(async () => {
    setStatus("loading");
    const user = await getSessionUser();
    if (!user?.email) {
      setStudent(null);
      setStatus("unauth");
      return;
    }

    if (!validateOrgEmail(user.email)) {
      await supabase.auth.signOut();
      setStudent(null);
      setStatus("unauthorized");
      return;
    }

    const role = await fetchUserRole(user.id);
    if (role && role !== "STUDENT") {
      await supabase.auth.signOut();
      setStudent(null);
      setStatus("unauthorized");
      return;
    }

    const [studentRow, perms] = await Promise.all([
      fetchStudentByEmail(user.email),
      fetchPermissions(),
    ]);

    setStudent(studentRow || null);
    setPermissions(perms);

    if (studentRow?.SECTION) {
      const regNo =
        studentRow.REG_NO || studentRow.reg_no || studentRow.REGNO || "";
      const [requests, completed] = await Promise.all([
        fetchNotifications(studentRow.SECTION),
        fetchCompletedFields(studentRow.SECTION, regNo),
      ]);
      setNotifications(requests);
      setCompletedFields(completed);
    } else {
      setNotifications([]);
      setCompletedFields([]);
    }

    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      load();
    });
    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, [load]);

  const dismissAll = () => {
    setDismissed(notifications.map((n) => n.id));
  };

  const activeNotifications = notifications.filter((n) => {
    const fieldLabel = (n.field_label || "").toUpperCase();
    return !dismissed.includes(n.id) && !completedFields.includes(fieldLabel);
  });

  const updateStudent = async (updates: Record<string, any>) => {
    if (!student) return null;
    const pk = student.id || student.ID || null;
    let query = supabase.from("Students").update(updates);
    if (pk) query = query.eq("id", pk);
    else if (student.OFFICIAL_MAIL || student.EMAIL || student.email) {
      const email =
        student.OFFICIAL_MAIL || student.EMAIL || student.email || "";
      query = query.eq("OFFICIAL_MAIL", String(email).trim().toLowerCase());
    } else {
      throw new Error("Cannot determine student record to update.");
    }
    const { data, error } = await query.select().single();
    if (error) throw error;
    setStudent(data);
    return data;
  };

  const markFieldComplete = async (fieldLabel: string) => {
    if (!student?.SECTION) return;
    const regNo = student.REG_NO || student.reg_no || student.REGNO || "";
    await markFieldUpdated(student.SECTION, regNo, fieldLabel);
    setCompletedFields((prev) => [...prev, String(fieldLabel).toUpperCase()]);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.replace("/login");
  };

  return {
    status,
    student,
    permissions,
    notifications: activeNotifications,
    reload: load,
    dismissAll,
    updateStudent,
    markFieldComplete,
    logout,
  };
}
