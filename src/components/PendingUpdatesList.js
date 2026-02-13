import React, {useState, useEffect} from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

function StatusChip({status}){
  const bg = status==='New'? '#fde68a' : status==='Overdue'? '#fecaca' : '#d1fae5';
  return <View style={[styles.chip,{backgroundColor:bg}]}><Text style={{fontSize:12}}>{status}</Text></View>
}

function FieldInput({field, onSave}){
  const [val,setVal] = useState(field.value||""
  );
  useEffect(()=>setVal(field.value||""),[field.value]);
  return (
    <View style={styles.card}>
      <View style={styles.rowTop}>
        <Text style={styles.label}>{field.label}</Text>
        {field.status? <StatusChip status={field.status} /> : null}
      </View>
      {field.help? <Text style={styles.help}>{field.help}</Text>:null}
      <TextInput value={val} onChangeText={setVal} style={styles.input} keyboardType={field.type==='number'? 'numeric' : 'default'} />
      <TouchableOpacity style={styles.saveBtn} onPress={()=>onSave(field.id,val)}>
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>
    </View>
  )
}

export default function PendingUpdatesList({pending, onSave}){
  if(!pending || pending.length===0){
    return <View style={{padding:12}}><Text style={{color:'#666'}}>No pending updates</Text></View>
  }
  return (
    <View>
      {pending.map(p=> <FieldInput key={p.id} field={p} onSave={onSave} />)}
    </View>
  )
}

const styles = StyleSheet.create({
  card:{padding:14,backgroundColor:'#fff',borderRadius:12,marginVertical:8,elevation:1},
  rowTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  label:{fontWeight:'700'},
  help:{color:'#666',fontSize:12,marginBottom:8},
  input:{borderWidth:1,borderColor:'#eee',padding:10,borderRadius:8,marginTop:8,marginBottom:10,backgroundColor:'#fafafa'},
  saveBtn:{backgroundColor:'#2563eb',paddingVertical:10,borderRadius:8,alignItems:'center'},
  saveText:{color:'#fff',fontWeight:'700'},
  chip:{paddingHorizontal:8,paddingVertical:4,borderRadius:16}
});
