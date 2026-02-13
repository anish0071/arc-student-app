import React from "react";
import { Redirect } from "expo-router";

export default function IndexRedirect() {
  // Use the Redirect component so navigation happens only when routing is ready
  return <Redirect href="/login" />;
}
