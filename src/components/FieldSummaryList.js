import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function FieldSummaryList({fields, onViewHistory}){
  if(!fields || fields.length===0) return <View style={{padding:12}}><Text style={{color:'#666'}}>No fields</Text></View>

  return (
    <View>
      {fields.map(item => (
        <TouchableOpacity key={item.id} style={styles.row} onPress={()=>onViewHistory(item.id)}>
          <View>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.meta}>{item.lastValue || '—'}</Text>
          </View>
          <Text style={styles.action}>History</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row:{padding:12,backgroundColor:'#fff',borderRadius:12,marginVertical:6,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  label:{fontWeight:'700'},
  meta:{color:'#666',fontSize:12},
  action:{color:'#2563eb',fontWeight:'700'}
});
