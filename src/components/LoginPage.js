import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
// Use Linking to build a redirect URL that includes the Expo callback path
import { supabase } from "../lib/supabase";
import { useStudent } from "../lib/student-context";

let AsyncStorage;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch (_e) {
  AsyncStorage = null;
}

const { height } = Dimensions.get("window");

const ALLOWED_DOMAIN = "citchennai.net"; // Organization email domain

// Required for OAuth to work properly on web
WebBrowser.maybeCompleteAuthSession();

// Build redirect URI that points to the app route handled by callback.tsx
const redirectUri = Linking.createURL("/auth/callback");

console.log("OAuth Redirect URI:", redirectUri);

// Validate that email belongs to the organization domain
const validateOrgEmail = (email) => {
  if (!email) return false;
  const normalizedEmail = email.toLowerCase().trim();
  return normalizedEmail.endsWith(`@${ALLOWED_DOMAIN}`);
};

// Decorative elements component
const DecorativeElements = () => (
  <>
    {/* Stars */}
    <Text style={[styles.star, { top: 60, left: 30 }]}>✦</Text>
    <Text style={[styles.star, { top: 80, right: 40 }]}>✦</Text>
    <Text style={[styles.star, { top: 150, left: 50 }]}>+</Text>
    <Text style={[styles.star, { top: 120, right: 60 }]}>+</Text>
    <Text style={[styles.star, { top: 200, right: 30 }]}>✦</Text>
    <Text style={[styles.star, { top: 180, left: 25 }]}>+</Text>

    {/* Clouds */}
    <View style={[styles.cloud, { top: 100, right: -20 }]}>
      <View style={styles.cloudCircle} />
      <View style={[styles.cloudCircle, { left: 15, top: 5 }]} />
      <View style={[styles.cloudCircle, { left: 30, top: 0 }]} />
    </View>
    <View style={[styles.cloud, { top: 160, left: -30 }]}>
      <View style={styles.cloudCircle} />
      <View style={[styles.cloudCircle, { left: 15, top: 5 }]} />
      <View style={[styles.cloudCircle, { left: 30, top: 0 }]} />
    </View>
    <View style={[styles.cloud, { top: 220, right: 20 }]}>
      <View style={[styles.cloudCircle, { width: 20, height: 20 }]} />
      <View
        style={[
          styles.cloudCircle,
          { left: 12, top: 3, width: 20, height: 20 },
        ]}
      />
    </View>
  </>
);

// Google Icon component
const GoogleIcon = () => (
  <View style={styles.googleIconContainer}>
    <Text style={styles.googleIconText}>G</Text>
  </View>
);

// Helper function to extract params from URL
const createSessionFromUrl = async (url) => {
  console.log("Parsing URL for tokens:", url);
  
  // Try to get params from hash fragment first (Supabase uses this)
  let params = {};
  let errorDescription = null;
  
  if (url.includes("#")) {
    const hashPart = url.split("#")[1];
    if (hashPart) {
      const hashParams = new URLSearchParams(hashPart);
      params.access_token = hashParams.get("access_token");
      params.refresh_token = hashParams.get("refresh_token");
      // Check for error in hash
      errorDescription = hashParams.get("error_description") || hashParams.get("error");
    }
  }
  
  // Also try query params
  if (!params.access_token && url.includes("?")) {
    const queryPart = url.split("?")[1]?.split("#")[0];
    if (queryPart) {
      const queryParams = new URLSearchParams(queryPart);
      params.access_token = queryParams.get("access_token");
      params.refresh_token = queryParams.get("refresh_token");
      // Check for error in query
      if (!errorDescription) {
        errorDescription = queryParams.get("error_description") || queryParams.get("error");
      }
    }
  }

  console.log("Parsed params - access_token:", !!params.access_token, "error:", errorDescription);

  if (errorDescription) {
    return { data: null, error: new Error(decodeURIComponent(errorDescription)) };
  }

  if (params.access_token) {
    const { data, error } = await supabase.auth.setSession({
      access_token: params.access_token,
      refresh_token: params.refresh_token || "",
    });
    return { data, error };
  }
  
  return { data: null, error: new Error("No access token found in URL") };
};

export default function LoginPage() {
  const router = useRouter();
  const { setStudentData } = useStudent();
  const [loading, setLoading] = useState(false);

  // Function to handle successful authentication
  const handleAuthSuccess = async (url) => {
    console.log("Processing auth URL:", url);
    
    try {
      // Extract and set session from the URL
      const { error: sessionError } = await createSessionFromUrl(url);

      if (sessionError) {
        console.error("Session error:", sessionError);
        Alert.alert("Authentication Error", sessionError.message || "Failed to create session");
        setLoading(false);
        return;
      }

      // Get the user to validate their email domain
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData?.user) {
        console.error("User error:", userError);
        Alert.alert("Error", "Failed to get user information");
        setLoading(false);
        return;
      }

      const userEmail = userData.user.email;
      console.log("User email:", userEmail);

      // Validate that the email belongs to the organization
      if (!validateOrgEmail(userEmail)) {
        await supabase.auth.signOut();
        Alert.alert(
          "Access Denied",
          `Only @${ALLOWED_DOMAIN} email addresses are allowed. Please sign in with your organization email.`
        );
        setLoading(false);
        return;
      }

      // Save user session
      if (AsyncStorage) {
        await AsyncStorage.setItem("@arc_user", JSON.stringify(userData.user));
      }

      // Check if this user has the STUDENT role
      try {
        const { data: profile, error: profileErr } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", userData.user.id)
          .maybeSingle();

        if (profileErr) {
          console.warn("Profile lookup failed", profileErr.message || profileErr);
        }

        const dbRole = profile?.role ? String(profile.role).toUpperCase() : null;

        if (!profile || dbRole !== "STUDENT") {
          Alert.alert(
            "Account Not Allowed",
            "This account is not set up for the student app. If you are a student, contact your administrator to link your account. Admins should use the web portal."
          );
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }
      } catch (_e) {
        // Continue even if profile check fails
      }

      // Fetch student details
      await fetchStudentDetails(userEmail);

      // Navigate to student dashboard
      setLoading(false);
      router.replace("/student");
    } catch (error) {
      console.error("Auth success handling error:", error);
      setLoading(false);
    }
  };

  const fetchStudentDetails = async (userEmail) => {
    const normalized = String(userEmail || "")
      .trim()
      .toLowerCase();
    try {
      const { data: student, error } = await supabase
        .from("Students")
        .select("*")
        .eq("OFFICIAL_MAIL", normalized)
        .maybeSingle();

      if (error) {
        setStudentData(null);
        return null;
      }

      if (student) {
        setStudentData(student);
        return student;
      }

      // Inform the user that their account isn't linked; do not create a new record.
      setStudentData(null);
      return null;
      // No linked student record; do not create a new record.
    } catch (_e) {
      return null;
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      console.log("Starting Google Sign-In with redirect URI:", redirectUri);
      
      // Get the OAuth URL from Supabase with domain restriction hint
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUri,
          queryParams: {
            // Restrict to organization domain
            hd: ALLOWED_DOMAIN,
            prompt: "select_account",
          },
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        console.error("OAuth error:", error);
        Alert.alert("Error", error.message);
        setLoading(false);
        return;
      }

      if (data?.url) {
        console.log("Opening auth URL:", data.url);
        
        // Use WebBrowser.openAuthSessionAsync which works with Expo Auth Proxy
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUri
        );

        console.log("Auth result:", result);

        if (result.type === "success" && result.url) {
          console.log("Success! Received URL:", result.url);
          await handleAuthSuccess(result.url);
        } else if (result.type === "cancel" || result.type === "dismiss") {
          console.log("User cancelled login");
          setLoading(false);
        } else {
          console.log("Auth result type:", result.type);
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      Alert.alert("Error", "Failed to sign in with Google. Please try again.");
      setLoading(false);
    }
  };

  // Listen for deep links (OAuth callback) and check existing session
  useEffect(() => {
    let isMounted = true;

    // Handle incoming URL (deep link from OAuth)
    const handleUrl = async (event) => {
      const url = typeof event === 'string' ? event : event?.url;
      if (!url) return;
      
      console.log("Received deep link URL:", url);
      
      // Check if this URL contains auth tokens
      if (url.includes("access_token") || url.includes("#access_token")) {
        setLoading(true);
        await handleAuthSuccess(url);
      }
    };

    // Check for initial URL (app opened via deep link)
    const checkInitialUrl = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        console.log("Initial URL:", initialUrl);
        await handleUrl(initialUrl);
      }
    };

    // Check existing session
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        const userEmail = data.session.user.email;
        if (validateOrgEmail(userEmail)) {
          // Check role before auto-redirecting
          try {
            const { data: profile } = await supabase
              .from("profiles")
              .select("role")
              .eq("user_id", data.session.user.id)
              .maybeSingle();

            const dbRole = profile?.role
              ? String(profile.role).toUpperCase()
              : null;

            if (profile && dbRole === "STUDENT") {
              await fetchStudentDetails(userEmail);
              if (isMounted) router.replace("/student");
            }
          } catch (_e) {
            // Ignore errors
          }
        } else {
          // Sign out if email doesn't match organization domain
          await supabase.auth.signOut();
        }
      }
    };

    checkInitialUrl();
    checkSession();

    // Listen for URL events (deep links while app is open)
    const subscription = Linking.addEventListener("url", handleUrl);

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  return (
    <View style={styles.root}>
      {/* Purple gradient background section */}
      <View style={styles.purpleSection}>
        <DecorativeElements />

        {/* Logo/Brand area */}
        <View style={styles.brandContainer}>
          <Text style={styles.logo}>ARC</Text>
          <Text style={styles.tagline}>Automated Reporting Central</Text>
        </View>
      </View>

      {/* White card section */}
      <View style={styles.whiteSection}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>
            Sign in with your organization Google account to continue
          </Text>

          <View style={styles.domainNote}>
            <Text style={styles.domainNoteText}>
              Only @{ALLOWED_DOMAIN} accounts are allowed
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.googleButton, loading && styles.buttonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#1f2937" size="small" />
            ) : (
              <>
                <GoogleIcon />
                <Text style={styles.googleButtonText}>
                  Sign in with Google
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.footer}>
            For more information, please see{" "}
            <Text style={styles.footerLink}>Privacy policy</Text>.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#7c3aed",
  },
  purpleSection: {
    height: height * 0.4,
    backgroundColor: "#7c3aed",
    position: "relative",
    overflow: "hidden",
  },
  brandContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  logo: {
    fontSize: 64,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 4,
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    marginTop: 8,
    fontWeight: "500",
  },
  star: {
    position: "absolute",
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
    fontWeight: "300",
  },
  cloud: {
    position: "absolute",
    flexDirection: "row",
  },
  cloudCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.25)",
    position: "absolute",
  },
  whiteSection: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -24,
    paddingTop: 40,
    paddingHorizontal: 24,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 24,
    lineHeight: 20,
    textAlign: "center",
  },
  domainNote: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 32,
    alignItems: "center",
  },
  domainNoteText: {
    fontSize: 13,
    color: "#4b5563",
    fontWeight: "500",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4285F4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  googleIconText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  googleButtonText: {
    color: "#1f2937",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 40,
    lineHeight: 18,
  },
  footerLink: {
    color: "#1f2937",
    fontWeight: "600",
  },
});
