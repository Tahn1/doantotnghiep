// src/screens/DapAnScreen.tsx
import React, { useState, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  FlatList,
} from "react-native";
import {
  useNavigation,
  useFocusEffect,
  useRoute,
} from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

// Gọi hàm loadMaDe
import { loadMaDe } from "../database/examDb";

type MaDeItem = {
  examId: string;
  code: string;
  answers: Record<number, string>;
};

export default function DapAnScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  // Giả sử ta nhận soCau từ params (đã được tính sẵn theo phiếu)
  // hoặc ta nhận "phieu" và chuyển sang soCau (nếu "Phiếu 20" => soCau=20, ...)
  const { examId = "1", soCau = 20 } = route.params || {};

  const [maDeList, setMaDeList] = useState<MaDeItem[]>([]);

  // focus => load DB
  useFocusEffect(
    useCallback(() => {
      loadMaDe(examId).then((list) => {
        setMaDeList(list);
      });
      return () => {};
    }, [examId])
  );

  // Nút back
  const goBack = () => {
    navigation.goBack();
  };

  // Demo icon
  const onCameraPress = () => {};
  const onScanPress = () => {};
  const onMorePress = () => {};

  // Bấm plus => "Tạo mới" => mode="create"
  const onAddPress = () => {
    navigation.navigate("MaDeAnswersScreen", {
      examId,
      soCau,
      mode: "create",
    });
  };

  // Bấm item => "Chỉnh sửa" => mode="edit"
  const onPressMaDeItem = (item: MaDeItem) => {
    navigation.navigate("MaDeAnswersScreen", {
      examId,
      soCau,
      mode: "edit",
      oldCode: item.code,
      oldAnswers: item.answers,
    });
  };

  const renderMaDeItem = ({ item }: { item: MaDeItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPressMaDeItem(item)}
    >
      <Text style={styles.cardLabel}>Mã đề</Text>
      <Text style={styles.cardValue}>{item.code}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <SafeAreaView style={{ flex: 0, backgroundColor: "orange" }} />
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="orange" barStyle="light-content" />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.leftContainer}>
            <TouchableOpacity onPress={goBack} style={styles.iconButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.centerContainer}>
            <Text style={styles.headerTitle}>Đáp án</Text>
          </View>

          <View style={styles.rightContainer}>
            <TouchableOpacity onPress={onCameraPress} style={styles.iconButton}>
              <Ionicons name="camera" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onScanPress} style={styles.iconButton}>
              <Ionicons name="qr-code" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onAddPress} style={styles.iconButton}>
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onMorePress} style={styles.iconButton}>
              <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Danh sách mã đề */}
        <View style={{ flex: 1, padding: 16 }}>
          <FlatList
            data={maDeList}
            keyExtractor={(item) => item.code}
            renderItem={renderMaDeItem}
            ListEmptyComponent={
              <Text style={{ textAlign: "center", color: "#999", marginTop: 20 }}>
                Chưa có mã đề
              </Text>
            }
          />
        </View>
      </SafeAreaView>
    </>
  );
}

// ========== Styles ==========
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "orange",
    height: 56,
  },
  leftContainer: {
    width: 50,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingLeft: 8,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  rightContainer: {
    width: 160,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingRight: 8,
  },
  iconButton: { marginHorizontal: 8 },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLabel: {
    fontSize: 16,
    color: "#666",
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});
