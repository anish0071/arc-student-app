import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function SkillRow({skill}){
  const pct = Math.max(6, Math.min(100, skill.level*10 || 20));
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{skill.name}</Text>
      <View style={styles.barBg}><View style={[styles.barFill,{width: pct+'%'}]} /></View>
      <Text style={styles.badge}>{skill.level}/10</Text>
    </View>
  )
}

export default function SkillsList({skills=[]}){
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Technical Skills</Text>
      {skills.map(s=> <SkillRow key={s.name} skill={s} />)}
    </View>
  )
}

const styles = StyleSheet.create({
  card:{padding:14,backgroundColor:'#fff',borderRadius:12,marginVertical:8},
  title:{fontWeight:'700',marginBottom:10},
  row:{flexDirection:'row',alignItems:'center',marginBottom:8},
  label:{flex:1},
  barBg:{height:8,flex:3,backgroundColor:'#f3f4f6',borderRadius:6,marginHorizontal:8,overflow:'hidden'},
  barFill:{height:8,backgroundColor:'#3b82f6'},
  badge:{width:40,textAlign:'right',color:'#666'}
});
