// src/screens/GiayThiScreen.tsx
import React from "react";
import { SafeAreaView,  View,  Text,  StyleSheet,  TouchableOpacity,  StatusBar,  ScrollView,  Image,} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function GiayThiScreen() {
  const navigation = useNavigation();

  // Mở Drawer
  const openDrawer = () => {
    navigation.openDrawer();
  };

  // Hàm tải phiếu (có thể mở link, save file,... tuỳ ý)
  const handleDownload = (paperId: string) => {
    console.log("Tải phiếu", paperId);
  };

  return (
    <>
      {/* SafeAreaView màu cam cho vùng status bar */}
      <SafeAreaView style={{ flex: 0, backgroundColor: "orange" }} />

      {/* SafeAreaView thứ hai chứa toàn bộ nội dung */}
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="orange" barStyle="light-content" />

        {/* Header custom màu cam */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer}>
            <Ionicons name="menu" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Giấy Thi</Text>
        </View>

        {/* Nội dung: danh sách phiếu thi */}
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.description}>
          </Text>

          {/* Phiếu 20 */}
          <View style={styles.paperItem}>
            <Image
              source={require("../../assets/Phieu20cau.png")}
              style={styles.paperImage}
            />
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={() => handleDownload("phiếu 20")}
            >
              <Text style={styles.downloadText}>TẢI PHIẾU 20</Text>
            </TouchableOpacity>
          </View>

          {/* Phiếu 60 */}
          <View style={styles.paperItem}>
            <Image
              source={require("../../assets/Phieu60cau.png")}
              style={styles.paperImage}
            />
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={() => handleDownload("phiếu 60")}
            >
              <Text style={styles.downloadText}>TẢI PHIẾU 60</Text>
            </TouchableOpacity>
          </View>

          {/* Phiếu THPTQG */}
          <View style={styles.paperItem}>
            <Image
              source={require("../../assets/PhieuTHPTQG.png")}
              style={styles.paperImage}
            />
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={() => handleDownload("phiếu THPTQG")}
            >
              <Text style={styles.downloadText}>TẢI PHIẾU THPTQG</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    marginLeft: 16,
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  content: {
    padding: 16,
  },
  description: {
    marginBottom: 16,
    fontSize: 16,
  },
  paperItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 20,
    padding: 16,
    elevation: 2,
    alignItems: "center",
  },
  paperImage: {
    width: 200,
    height: 300,
    resizeMode: "contain",
    marginBottom: 10,
  },
  downloadButton: {
    backgroundColor: "orange",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  downloadText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
