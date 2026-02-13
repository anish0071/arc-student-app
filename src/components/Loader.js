import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";

export default function Loader(){
  return (
    <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>
  )
}
const styles = StyleSheet.create({center:{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'transparent'}});
