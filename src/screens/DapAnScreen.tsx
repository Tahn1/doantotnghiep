// src/screens/DapAnScreen.tsx
import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function DapAnScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { examId, title, phieu, soCau } = route.params || {};

  const goBack = () => {
    navigation.goBack();
  };

  // Demo icon bấm
  const onCameraPress = () => {
    console.log("Camera...");
  };
  const onSharePress = () => {
    console.log("Share...");
  };
  const onAddPress = () => {
    console.log("Add...");
  };

  return (
    <>
      <SafeAreaView style={{ flex: 0, backgroundColor: "orange" }} />
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="orange" barStyle="light-content" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Đáp án</Text>

          {/* Icons bên phải */}
          <View style={styles.rightHeader}>
            <TouchableOpacity
              onPress={onCameraPress}
              style={{ marginRight: 15 }}
            >
              <Ionicons name="camera" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSharePress}
              style={{ marginRight: 15 }}
            >
              <Ionicons name="share-social" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onAddPress}>
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Nội dung */}
        <View style={styles.content}>
          <Text>Màn hình nhập đáp án</Text>
          <Text>Exam ID: {examId}</Text>
          <Text>Phiếu: {phieu}</Text>
          <Text>Số câu: {soCau}</Text>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: "orange",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    flex: 1,
    marginLeft: 16,
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  rightHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
