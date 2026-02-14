import { useCallback, useEffect, useState } from "react";
import {
  fetchCompletedFields,
  fetchNotifications,
  fetchPermissions,
  fetchStudentByEmail,
  getSessionUser,
} from "./arcData";

export function useDashboardData() {
  const [student, setStudent] = useState<any | null>(null);
  const [permissions, setPermissions] = useState<Record<string, any>>({});
  const [notifications, setNotifications] = useState<any[]>([]);
  const [completedFields, setCompletedFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const user = await getSessionUser();
      if (!user?.email) {
        setStudent(null);
        setLoading(false);
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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const dismissAll = () => {
    setDismissed(notifications.map((n) => n.id));
  };

  const activeNotifications = notifications.filter((n) => {
    const fieldLabel = (n.field_label || "").toUpperCase();
    return !dismissed.includes(n.id) && !completedFields.includes(fieldLabel);
  });

  return {
    student,
    permissions,
    notifications: activeNotifications,
    loading,
    reload: loadAll,
    dismissAll,
  };
}
