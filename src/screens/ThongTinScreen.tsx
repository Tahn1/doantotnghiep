// src/screens/ThongTinScreen.tsx
import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";

// Import hàm lấy stats từ DB
import { getExamStatsAsync, ExamStatsItem } from "../database/examDb";

/** Component hiển thị 1 hàng: label, value */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function ThongTinScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  // Nhận examId + các trường cơ bản (title, phieu, soCau, ...) từ params
  const {
    examId,
    title = "TEST",
    phieu = "20",
    soCau = 20,
  } = route.params || {};

  // State lưu thống kê (soBaiCham, soDapAn, diemTrungBinh, ...)
  const [stats, setStats] = useState<ExamStatsItem | null>(null);

  // Hàm back
  const goBack = () => {
    navigation.goBack();
  };

  // Mỗi lần màn hình focus => load stats từ DB
  useFocusEffect(
    React.useCallback(() => {
      if (!examId) return;

      (async () => {
        // Gọi hàm getExamStatsAsync trong examDb
        const result = await getExamStatsAsync(examId);
        if (result) {
          setStats(result);
        }
      })();
    }, [examId])
  );

  // Trích xuất các trường stats
  const soBaiCham = stats?.soBaiCham ?? 0;
  const soDapAn = stats?.soDapAn ?? 0; // Số mã đề distinct
  const diemTrungBinh = stats?.diemTrungBinh ?? 0.0;
  const diemThapNhat = stats?.diemThapNhat ?? 0.0;
  const diemCaoNhat = stats?.diemCaoNhat ?? 0.0;

  return (
    <>
      {/* Safe area iOS */}
      <SafeAreaView style={{ flex: 0, backgroundColor: "orange" }} />
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="orange" barStyle="light-content" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thông tin</Text>
        </View>

        {/* Nội dung thông tin */}
        <View style={styles.content}>
          <InfoRow label="Tên bài" value={String(title)} />
          <InfoRow label="Phiếu chấm" value={String(phieu)} />
          <InfoRow label="Số câu" value={String(soCau)} />
          <InfoRow label="Số bài chấm" value={String(soBaiCham)} />
          <InfoRow label="Số đáp án" value={String(soDapAn)} />
          <InfoRow label="Điểm trung bình" value={diemTrungBinh.toFixed(2)} />
          <InfoRow label="Điểm thấp nhất" value={diemThapNhat.toFixed(2)} />
          <InfoRow label="Điểm cao nhất" value={diemCaoNhat.toFixed(2)} />
        </View>
      </SafeAreaView>
    </>
  );
}

// ==================== STYLES =====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "orange",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 56,
  },
  iconButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
  infoLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 16,
    color: "#cc0000", // bạn tùy chỉnh màu
  },
});
