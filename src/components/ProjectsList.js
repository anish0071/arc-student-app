import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ProjectsList({projects=[]}){
  if(!projects || projects.length===0) return null;
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Projects</Text>
      {projects.map(p=> (
        <View key={p.title} style={styles.row}>
          <View style={{flex:1}}>
            <Text style={styles.projectTitle}>{p.title}</Text>
            <Text style={styles.detail}>{p.description}</Text>
          </View>
          {p.url ? <TouchableOpacity onPress={()=>{}}><Text style={styles.link}>View</Text></TouchableOpacity> : null}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  card:{padding:14,backgroundColor:'#fff',borderRadius:12,marginVertical:8},
  title:{fontWeight:'700',marginBottom:10},
  row:{flexDirection:'row',alignItems:'center',marginBottom:10},
  projectTitle:{fontWeight:'700'},
  detail:{color:'#666',fontSize:12,marginTop:4},
  link:{color:'#2563eb',fontWeight:'700'}
});
