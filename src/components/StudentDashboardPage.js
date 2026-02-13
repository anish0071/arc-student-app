import React, {useEffect, useState, useContext, useCallback} from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { ThemeContext } from "../lib/theme";
import { useStudent } from "../lib/student-context";
import { usePermissions } from "../lib/permissions-context";
import { useNotifications } from "../lib/notifications-context";
import { supabase } from "../lib/supabase";
import Loader from "./Loader";
import EmptyState from "./EmptyState";
import UpdateAlertBanner from "./UpdateAlertBanner";

const {width} = Dimensions.get('window');

// Uniform icon background color
const ICON_BG = '#e0e7ff';

export default function StudentDashboardPage(){
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useContext(ThemeContext);
  const { studentData, clearStudentData, setStudentData, reloadStudentData } = useStudent();
  const { refreshPermissions } = usePermissions();
  const { notifications, fetchNotifications, dismissAll } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const student = studentData || {};
  const hasStudent = Boolean(studentData);

  // Fetch notifications when student data is available
  useEffect(() => {
    if (student.SECTION) {
      const regNo = student.REG_NO || student.reg_no || student.REGNO;
      fetchNotifications(student.SECTION, regNo);
    }
  }, [student.SECTION, student.REG_NO, student.reg_no, student.REGNO, fetchNotifications]);

  const handleLogout = async () => {
    let AsyncStorage;
    try {
      AsyncStorage = require("@react-native-async-storage/async-storage").default;
    } catch (e) {
      AsyncStorage = null;
    }

    try {
      setLoading(true);
      await supabase.auth.signOut();
    } catch (e) {
      // ignore errors from signOut but continue clearing client state
    } finally {
      if (AsyncStorage) {
        try {
          await AsyncStorage.removeItem("@arc_user");
        } catch (e) {
          // ignore
        }
      }
      clearStudentData();
      router.replace("/login");
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const regNo = student.REG_NO || student.reg_no || student.REGNO;
      await Promise.all([
        reloadStudentData(),
        refreshPermissions(),
        student.SECTION ? fetchNotifications(student.SECTION, regNo) : Promise.resolve(),
      ]);
    } catch (e) {
      // ignore
    } finally {
      setRefreshing(false);
    }
  }, [reloadStudentData, refreshPermissions, fetchNotifications, student.SECTION, student.REG_NO, student.reg_no, student.REGNO]);

  const ListItem = ({icon, title, subtitle, onPress, disabled}) => (
    <TouchableOpacity
      style={[
        listStyles.row,
        { backgroundColor: theme.surface, opacity: disabled ? 0.5 : 1 },
      ]}
      onPress={disabled ? undefined : onPress}
      activeOpacity={disabled ? 1 : 0.7}
      disabled={disabled}
    >
      <View style={[listStyles.iconWrap, {backgroundColor: isDark ? theme.surface : ICON_BG}]}>
        <Text style={listStyles.icon}>{icon}</Text>
      </View>
      <View style={{flex:1}}>
        <Text style={[listStyles.title, {color: theme.text}]}>{title}</Text>
        {subtitle ? <Text style={[listStyles.subtitle, {color: theme.textSecondary}]}>{subtitle}</Text> : null}
      </View>
      <Text style={[listStyles.arrow, {color: theme.textSecondary}]}>›</Text>
    </TouchableOpacity>
  );

  if(loading) return <Loader />;

  const initials = (student.NAME || 'ST').split(' ').map(s => s[0]).join('').slice(0,2).toUpperCase();

  // Get subtitles from database
  const lcSubtitle = student.LC_TOTAL_PROBLEMS ? `${student.LC_TOTAL_PROBLEMS} problems solved` : '-';
  const srSubtitle = student.SR_PROBLEMS_SOLVED ? `${student.SR_PROBLEMS_SOLVED} problems • Rank: ${student.SR_RANK || '-'}` : '-';
  const cfSubtitle = student.CF_RATING ? `Rating: ${student.CF_RATING}` : '-';
  const ccSubtitle = student.CC_RATING ? `Rating: ${student.CC_RATING}` : '-';
  const ghSubtitle = student.GITHUB_ID || '-';
  const liSubtitle = student.LINKEDIN_URL ? 'View profile' : '-';
  const resumeSubtitle = student.RESUME_LINK ? 'Linked' : '-';

  return (
    <View style={[styles.root, {backgroundColor: theme.background}]}>
      {/* Colored header */}
      <View style={[styles.header, {backgroundColor: theme.primary}]}>
        <View style={styles.headerTop}>
          <View style={styles.backBtn} />
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={handleLogout} style={{ marginRight: 12 }}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleTheme}>
              <Text style={styles.menuDots}>{isDark ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.illustration} />
      </View>

      {/* Overlapping white card */}
      <View style={styles.cardWrap}>
        <View style={[styles.card, {backgroundColor: theme.surface}]}>
          <View style={styles.avatarWrap}>
            <View style={[styles.avatar, {backgroundColor: theme.secondary}]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={hasStudent ? () => router.push('/profile') : undefined}
            disabled={!hasStudent}
            style={{ width: '100%', alignItems: 'center' }}
          >
            <Text style={[styles.name, {color: theme.text}]}>{student.NAME || '-'}</Text>
          </TouchableOpacity>
          <Text style={[styles.subtitle, {color: theme.textSecondary}]}>
            {student.SECTION || student.sec || '-'} • {student.DEPT || '-'}
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={{paddingBottom:40}}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Prominent notification banner when advisor requests updates */}
        {notifications && notifications.length > 0 && (
          <UpdateAlertBanner
            fields={notifications}
            onDismiss={dismissAll}
            onNavigate={(route, requiredFields) => {
              // Pass fields as route params for highlighting
              const params = requiredFields && requiredFields.length > 0 
                ? { highlight: requiredFields.join(',') } 
                : {};
              router.push({ pathname: route, params });
            }}
          />
        )}

        {!hasStudent ? (
          <EmptyState
            title="No student record linked"
            subtitle="You're logged in, but your account isn't mapped to a Students row yet. Please contact the admin/placement office to link your official mail."
          />
        ) : null}

        <Text style={[styles.sectionTitle, {color: theme.text}]}>Coding Platforms</Text>

        <ListItem icon="▶️" title="LeetCode" subtitle={lcSubtitle} onPress={() => router.push('/leetcode')} disabled={!hasStudent} />
        <ListItem icon="🎯" title="Skillrack" subtitle={srSubtitle} onPress={() => router.push('/skillrack')} disabled={!hasStudent} />
        <ListItem icon="🍴" title="CodeChef" subtitle={ccSubtitle} onPress={() => router.push('/codechef')} disabled={!hasStudent} />

        <Text style={[styles.sectionTitle, {color: theme.text}]}>Profiles & Documents</Text>

        <ListItem icon="💻" title="GitHub" subtitle={ghSubtitle} onPress={() => router.push('/github')} disabled={!hasStudent} />
        <ListItem icon="🔗" title="LinkedIn" subtitle={liSubtitle} onPress={() => router.push('/linkedin')} disabled={!hasStudent} />
        <ListItem icon="📄" title="Resume" subtitle={resumeSubtitle} onPress={() => router.push('/resume')} disabled={!hasStudent} />
      </ScrollView>
    </View>
  );
}

const listStyles = StyleSheet.create({
  row: {
    flexDirection:'row',
    alignItems:'center',
    padding:14,
    borderRadius:20,
    marginBottom:12,
    shadowColor:'#7c3aed',
    shadowOpacity:0.06,
    shadowRadius:10,
    shadowOffset: {width:0, height:3},
    elevation:2
  },
  iconWrap: {
    width:48,
    height:48,
    borderRadius:16,
    alignItems:'center',
    justifyContent:'center',
    marginRight:14,
    backgroundColor:'#ede9fe' // violet-100
  },
  icon: {fontSize:22},
  title: {fontWeight:'700', fontSize:15, letterSpacing:0.2},
  subtitle: {fontSize:12, marginTop:3, opacity:0.8},
  arrow: {fontSize:22, fontWeight:'400', color:'#a78bfa'}
});

const HEADER_HEIGHT = 240;
const CARD_OVERLAP = 80;

const styles = StyleSheet.create({
  root: {flex:1},
  header: {height:HEADER_HEIGHT, borderBottomLeftRadius:32, borderBottomRightRadius:32},
  headerTop: {flexDirection:'row', justifyContent:'space-between', paddingHorizontal:20, paddingTop:52},
  backBtn: {width:36, height:36},
  menuDots: {fontSize:20},
  logoutText: {color:'#fff', fontSize:13, fontWeight:'700', marginRight:8, letterSpacing:0.5},
  illustration: {position:'absolute', bottom:28, right:20, width:110, height:90, backgroundColor:'rgba(255,255,255,0.15)', borderRadius:20},

  cardWrap: {marginTop:-CARD_OVERLAP, paddingHorizontal:20},
  card: {borderRadius:28, paddingTop:56, paddingBottom:24, paddingHorizontal:24, alignItems:'center', shadowColor:'#7c3aed', shadowOpacity:0.12, shadowRadius:20, shadowOffset:{width:0, height:8}, elevation:8},
  avatarWrap: {position:'absolute', top:-46},
  avatar: {width:92, height:92, borderRadius:46, alignItems:'center', justifyContent:'center', borderWidth:4, borderColor:'#fff'},
  avatarText: {color:'#fff', fontWeight:'800', fontSize:32},
  name: {fontSize:24, fontWeight:'800', marginTop:12, letterSpacing:0.3, textAlign:'center', width:'100%', paddingHorizontal:8},
  subtitle: {fontSize:13, marginTop:6, letterSpacing:0.4, textAlign:'center', width:'100%'},

  content: {flex:1, paddingHorizontal:20, paddingTop:18},
  sectionTitle: {fontSize:11, fontWeight:'800', marginTop:26, marginBottom:14, letterSpacing:1.5, textTransform:'uppercase', opacity:0.6}
});
