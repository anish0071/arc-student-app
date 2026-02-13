import React from 'react';
import { View, Text, Linking, TouchableOpacity, StyleSheet } from 'react-native';

export default function CodingStats({stats={}}){
  // stats: {leetcode:{count, rating}, codeforces:{rating, max}, codechef:{rating}, github:{repos, followers}, skillrack:{score}}
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Coding Platforms</Text>
      <View style={styles.row}>
        <View style={styles.block}>
          <Text style={styles.label}>LeetCode</Text>
          <Text style={styles.value}>{stats.leetcode?.count ?? '—'} solved</Text>
          <Text style={styles.small}>Rating: {stats.leetcode?.rating ?? '—'}</Text>
        </View>
        <View style={styles.block}>
          <Text style={styles.label}>Codeforces</Text>
          <Text style={styles.value}>{stats.codeforces?.rating ?? '—'}</Text>
          <Text style={styles.small}>Max: {stats.codeforces?.max ?? '—'}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.block}>
          <Text style={styles.label}>CodeChef</Text>
          <Text style={styles.value}>{stats.codechef?.rating ?? '—'}</Text>
        </View>
        <View style={styles.block}>
          <Text style={styles.label}>GitHub</Text>
          <Text style={styles.value}>{stats.github?.repos ?? 0} repos</Text>
          <Text style={styles.small}>{stats.github?.followers ?? 0} followers</Text>
        </View>
      </View>

      <View style={styles.linksRow}>
        {stats.github?.url ? <TouchableOpacity onPress={()=>Linking.openURL(stats.github.url)}><Text style={styles.link}>GitHub</Text></TouchableOpacity> : null}
        {stats.linkedin ? <TouchableOpacity onPress={()=>Linking.openURL(stats.linkedin)}><Text style={styles.link}>LinkedIn</Text></TouchableOpacity> : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card:{padding:14,backgroundColor:'#fff',borderRadius:12,marginVertical:8},
  title:{fontWeight:'700',fontSize:16,marginBottom:8},
  row:{flexDirection:'row',justifyContent:'space-between'},
  block:{flex:1,paddingRight:8},
  label:{color:'#666',fontSize:12},
  value:{fontWeight:'700',fontSize:14,marginTop:4},
  small:{color:'#666',fontSize:12,marginTop:4},
  linksRow:{flexDirection:'row',marginTop:12,gap:12},
  link:{color:'#2563eb',fontWeight:'700',marginRight:12}
});
