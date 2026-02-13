import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function HeaderBar({title='ARC', lastSync, onLogout, light=false}){
  return (
    <View style={[styles.container, light && styles.containerLight]}>
      <Text style={[styles.title, light && styles.titleLight]}>{title}</Text>
      <View style={styles.right}>
        <Text style={[styles.sync, light && styles.syncLight]}>Last sync{lastSync?": "+lastSync:""}</Text>
        <TouchableOpacity onPress={onLogout} style={[styles.logout, light && styles.logoutLight]}>
          <Text style={[styles.logoutText, light && styles.logoutTextLight]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:12},
  title:{fontSize:22,fontWeight:'700'},
  right:{flexDirection:'row',alignItems:'center'},
  sync:{color:'#666',marginRight:12},
  logout:{backgroundColor:'#ff5252',paddingVertical:6,paddingHorizontal:10,borderRadius:8},
  logoutText:{color:'#fff',fontWeight:'600'},
  /* light variant */
  containerLight:{},
  titleLight:{color:'#fff'},
  syncLight:{color:'rgba(255,255,255,0.9)'},
  logoutLight:{backgroundColor:'rgba(255,255,255,0.12)'},
  logoutTextLight:{color:'#fff'}
});
