import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function EmptyState({title='Nothing here', subtitle=''}){
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container:{padding:24,alignItems:'center'},
  title:{fontSize:16,color:'#666',fontWeight:'600'},
  subtitle:{color:'#999',marginTop:8}
});
