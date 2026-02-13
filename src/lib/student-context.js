import React, { createContext, useState, useContext } from "react";
import { supabase } from "./supabase";

const StudentContext = createContext();

export const StudentProvider = ({ children }) => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false);

  const updateStudentData = (data) => {
    setStudentData(data);
  };

  const reloadStudentData = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userEmail = userData?.user?.email;
      if (!userEmail) {
        setStudentData(null);
        return null;
      }

      const normalized = String(userEmail).trim().toLowerCase();
      const { data: student, error } = await supabase
        .from("Students")
        .select("*")
        .eq("OFFICIAL_MAIL", normalized)
        .maybeSingle();

      if (!error && student) {
        setStudentData(student);
        return student;
      }

      // try matching on EMAIL field as a fallback
      const { data: student2, error: err2 } = await supabase
        .from("Students")
        .select("*")
        .eq("EMAIL", normalized)
        .maybeSingle();

      if (!err2 && student2) {
        setStudentData(student2);
        return student2;
      }

      setStudentData(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearStudentData = () => {
    setStudentData(null);
  };

  return (
    <StudentContext.Provider
      value={{
        studentData,
        setStudentData: updateStudentData,
        clearStudentData,
        loading,
        setLoading,
        reloadStudentData,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error("useStudent must be used within StudentProvider");
  }
  return context;
};
