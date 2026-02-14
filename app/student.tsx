import React from "react";
import { Platform } from "react-native";
import StudentDashboardPage from "../src/components/StudentDashboardPage";
import StudentDashboardWeb from "../src/web/pages/StudentDashboardPage";

export default function StudentRoute() {
  if (Platform.OS === "web") {
    return <StudentDashboardWeb />;
  }
  return <StudentDashboardPage />;
}
