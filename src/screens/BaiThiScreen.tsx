// src/screens/BaiThiScreen.tsx
import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

// Data 5 mục
const MENU_ITEMS = [
  { id: "1", label: "Đáp án", screen: "DapAn", icon: "key" },
  { id: "2", label: "Chấm bài", screen: "ChamBai", icon: "camera" },
  { id: "3", label: "Xem lại", screen: "XemLai", icon: "chatbox-ellipses" },
  { id: "4", label: "Thống kê", screen: "ThongKe", icon: "bar-chart" },
  { id: "5", label: "Thông tin", screen: "ThongTin", icon: "information-circle",},
];

export default function BaiThiScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  // Nhận examId (hoặc các params) từ KiemTraScreen
  const { examId, title, phieu, soCau } = route.params || {};

  // Quay lại
  const goBack = () => {
    navigation.goBack();
  };

  // Render header màu cam
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={goBack} style={{ marginRight: 16 }}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Bài thi</Text>
    </View>
  );

  // Khi bấm 1 mục
  const onPressItem = (item: any) => {
    // Chuyển sang màn hình tương ứng (DapAn, ChamBai, ...)
    // Không gán cứng soBaiCham, soDapAn, etc.
    navigation.navigate(item.screen, {
      examId,
      title,
      phieu,
      soCau,
    });
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.menuItem} onPress={() => onPressItem(item)}>
      <View style={styles.menuItemLeft}>
        <Ionicons
          name={item.icon}
          size={24}
          color="orange"
          style={{ marginRight: 12 }}
        />
        <Text style={styles.menuLabel}>{item.label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  return (
    <>
      <SafeAreaView style={{ flex: 0, backgroundColor: "orange" }} />
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="orange" barStyle="light-content" />
        {renderHeader()}

        {/* Danh sách 5 mục */}
        <FlatList
          data={MENU_ITEMS}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "orange",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  menuItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2, // Android
    shadowColor: "#000", // iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    justifyContent: "space-between",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuLabel: {
    fontSize: 16,
  },
});
