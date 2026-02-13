import React, { createContext, useState, useContext, useCallback, useRef } from "react";
import { supabase, markFieldUpdated, fetchCompletedFields } from "./supabase";

const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState([]);
  const [completedFields, setCompletedFields] = useState([]);
  // Store current student info for per-student tracking
  const currentStudentRef = useRef({ section: null, regNo: null });

  // Fetch active field update requests for a student's section
  // Also loads already-completed fields for this specific student
  const fetchNotifications = useCallback(async (section, regNo = null) => {
    if (!section) {
      setNotifications([]);
      setCompletedFields([]);
      return [];
    }

    setLoading(true);
    try {
      const normalizedSection = String(section).trim().toUpperCase();
      currentStudentRef.current = { section: normalizedSection, regNo };

      // Query field_update_requests for this section (use ilike for case-insensitive)
      const { data, error } = await supabase
        .from("field_update_requests")
        .select("*")
        .ilike("section", normalizedSection);

      if (error) {
        console.warn("fetchNotifications error:", error);
        setNotifications([]);
        return [];
      }

      const items = Array.isArray(data) ? data : [];
      setNotifications(items);

      // If we have regNo, load already-completed fields for THIS student
      if (regNo) {
        const alreadyCompleted = await fetchCompletedFields(normalizedSection, regNo);
        setCompletedFields(alreadyCompleted.map((f) => String(f).toUpperCase()));
      } else {
        setCompletedFields([]);
      }

      return items;
    } catch (err) {
      console.warn("fetchNotifications failed:", err);
      setNotifications([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark a field as completed by the student and remove it from notifications
  const markFieldComplete = useCallback(async (section, regNo, fieldLabel) => {
    try {
      // Mark in database
      await markFieldUpdated(section, regNo, fieldLabel);

      // Remove from local notifications list
      setCompletedFields((prev) => [...prev, fieldLabel.toUpperCase()]);

      return { success: true };
    } catch (err) {
      console.warn("markFieldComplete failed:", err);
      return { success: false, error: err };
    }
  }, []);

  const dismissNotification = useCallback((id) => {
    setDismissed((prev) => [...prev, id]);
  }, []);

  const dismissAll = useCallback(() => {
    setDismissed(notifications.map((n) => n.id));
  }, [notifications]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setDismissed([]);
    setCompletedFields([]);
  }, []);

  // Filter out dismissed notifications AND completed fields
  const activeNotifications = notifications.filter((n) => {
    const fieldLabel = (n.field_label || "").toUpperCase();
    return !dismissed.includes(n.id) && !completedFields.includes(fieldLabel);
  });

  return (
    <NotificationsContext.Provider
      value={{
        notifications: activeNotifications,
        allNotifications: notifications,
        completedFields,
        loading,
        fetchNotifications,
        markFieldComplete,
        dismissNotification,
        dismissAll,
        clearNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationsProvider"
    );
  }
  return context;
};
