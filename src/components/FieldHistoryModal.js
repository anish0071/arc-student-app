import React from "react";
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";

export default function FieldHistoryModal({visible, onClose, history}){
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>History</Text>
          <TouchableOpacity onPress={onClose} style={styles.close}><Text style={styles.closeText}>Close</Text></TouchableOpacity>
        </View>
        {!history || history.length===0 ? <View style={styles.empty}><Text style={{color:'#666'}}>No history yet.</Text></View> : (
          <FlatList data={history} keyExtractor={(i,idx)=>idx.toString()} renderItem={({item})=> (
            <View style={styles.row}><Text style={styles.date}>{item.date}</Text><Text>{item.value}</Text></View>
          )} />
        )}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container:{flex:1,padding:16,backgroundColor:'#fff'},
  header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:12},
  title:{fontSize:18,fontWeight:'700'},
  close:{backgroundColor:'#eee',paddingVertical:6,paddingHorizontal:10,borderRadius:8},
  closeText:{fontWeight:'700'},
  row:{padding:12,borderBottomWidth:1,borderBottomColor:'#f3f4f6'},
  date:{color:'#666',fontSize:12,marginBottom:6},
  empty:{padding:24,alignItems:'center'}
});
