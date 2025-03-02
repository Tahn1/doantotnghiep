import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Modal,
  TextInput,
  Alert,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// Import các hàm async
import {
  ExamItem,
  getAllExamsAsync,
  addExamAsync,
  updateExamAsync,
  deleteExamAsync,
} from "../database/examDb";

// Danh sách phiếu
const PHIEU_OPTIONS = ["Phiếu 20", "Phiếu 60", "Phiếu 120"];

// Hàm trả về số câu tối đa dựa theo phiếu
function getMaxSoCau(phieu: string): number {
  if (phieu === "Phiếu 120") return 120;
  if (phieu === "Phiếu 60") return 60;
  if (phieu === "Phiếu 20") return 20;
  return 120;
}

export default function KiemTraScreen() {
  const navigation = useNavigation();

  // Danh sách các bài kiểm tra
  const [exams, setExams] = useState<ExamItem[]>([]);

  // Modal Tạo/Chỉnh sửa
  const [modalVisible, setModalVisible] = useState(false);

  // Form nhập
  const [title, setTitle] = useState("");
  const [phieu, setPhieu] = useState("Phiếu 20");
  const [soCau, setSoCau] = useState("20");

  // Chế độ Tạo (false) hay Chỉnh sửa (true)
  const [isEditing, setIsEditing] = useState(false);
  const [editingExamId, setEditingExamId] = useState<number | null>(null);

  // Modal chọn phiếu
  const [choosePhieuModalVisible, setChoosePhieuModalVisible] = useState(false);

  // Modal tùy chọn (long press)
  const [optionModalVisible, setOptionModalVisible] = useState(false);
  const [selectedExam, setSelectedExam] = useState<ExamItem | null>(null);

  // Khi load màn hình, gọi DB async để lấy danh sách
  useEffect(() => {
    loadExams();
  }, []);

  async function loadExams() {
    try {
      const data = await getAllExamsAsync();
      setExams(data);
    } catch (error) {
      console.log("Lỗi getAllExamsAsync:", error);
    }
  }

  // Mở Drawer
  const openDrawer = () => {
    navigation.openDrawer();
  };

  // Search / Sort demo
  const searchExams = () => {
    Alert.alert("Search", "Tìm kiếm bài kiểm tra...");
  };
  const sortExams = () => {
    Alert.alert("Sort", "Sắp xếp bài kiểm tra...");
  };

  // Mở modal Tạo bài
  const onOpenCreateModal = () => {
    setIsEditing(false);
    setEditingExamId(null);
    // Reset form
    setTitle("");
    setPhieu("Phiếu 20");
    setSoCau("20");
    setModalVisible(true);
  };

  // Đóng modal
  const onCloseModal = () => {
    setModalVisible(false);
    setIsEditing(false);
    setEditingExamId(null);
    // Reset form
    setTitle("");
    setPhieu("Phiếu 20");
    setSoCau("20");
  };

  // Tạo bài kiểm tra
  async function onCreateExam() {
    if (!title.trim()) {
      Alert.alert("Lỗi", "Bạn chưa nhập Tên bài!");
      return;
    }
    const numSoCau = parseInt(soCau, 10);
    if (!numSoCau) {
      Alert.alert("Lỗi", "Bạn chưa nhập Số câu!");
      return;
    }
    const maxCau = getMaxSoCau(phieu);
    if (numSoCau < 1 || numSoCau > maxCau) {
      Alert.alert("Lỗi", `Số câu phải từ 1 đến ${maxCau} (vì bạn chọn ${phieu})!`);
      return;
    }

    // Tạo date
    const now = new Date();
    const dateString = `${now.getDate()}-Thg ${now.getMonth() + 1}-${now.getFullYear()}`;

    const newExam: ExamItem = {
      id: Date.now(),
      title: title.trim(),
      phieu,
      soCau: numSoCau,
      date: dateString,
    };

    try {
      await addExamAsync(newExam);
      onCloseModal();
      loadExams(); // reload
    } catch (error) {
      console.log("Lỗi addExamAsync:", error);
    }
  }

  // Mở modal Chỉnh sửa
  const onEditExam = (exam: ExamItem) => {
    setIsEditing(true);
    setEditingExamId(exam.id);
    setTitle(exam.title);
    setPhieu(exam.phieu);
    setSoCau(String(exam.soCau));
    setModalVisible(true);
  };

  // Lưu bài kiểm tra sau khi chỉnh sửa
  async function onUpdateExam() {
    if (!editingExamId) return;
    if (!title.trim()) {
      Alert.alert("Lỗi", "Bạn chưa nhập Tên bài!");
      return;
    }
    const numSoCau = parseInt(soCau, 10);
    if (!numSoCau) {
      Alert.alert("Lỗi", "Bạn chưa nhập Số câu!");
      return;
    }
    const maxCau = getMaxSoCau(phieu);
    if (numSoCau < 1 || numSoCau > maxCau) {
      Alert.alert("Lỗi", `Số câu phải từ 1 đến ${maxCau} (vì bạn chọn ${phieu})!`);
      return;
    }

    try {
      await updateExamAsync(editingExamId, title.trim(), phieu, numSoCau);
      onCloseModal();
      loadExams();
    } catch (error) {
      console.log("Lỗi updateExamAsync:", error);
    }
  }

  // Xoá bài
  async function onDeleteExam(examId: number) {
    try {
      await deleteExamAsync(examId);
      loadExams();
    } catch (error) {
      console.log("Lỗi deleteExamAsync:", error);
    }
  }

  // Chọn phiếu
  const onChoosePhieu = (value: string) => {
    setPhieu(value);
    const max = getMaxSoCau(value);
    setSoCau(String(max));
    setChoosePhieuModalVisible(false);
  };

  // Mở modal tuỳ chọn (long press)
  const onLongPressExam = (exam: ExamItem) => {
    setSelectedExam(exam);
    setOptionModalVisible(true);
  };
  const onCloseOptionModal = () => {
    setSelectedExam(null);
    setOptionModalVisible(false);
  };

  // Render 1 item
  const renderExamItem = ({ item }: { item: ExamItem }) => (
    <TouchableOpacity
      style={styles.examItem}
      onPress={() => {
        navigation.navigate("BaiThi", {
          examId: item.id,
          title: item.title,
          phieu: item.phieu,
          soCau: item.soCau,
        });
      }}
      onLongPress={() => onLongPressExam(item)}
    >
      <Text style={styles.examTitle}>{item.title}</Text>
      <View style={styles.examInfoRow}>
        <Text style={styles.examInfo}>{item.phieu}</Text>
        <Text style={styles.examInfo}>{item.date}</Text>
        <Text style={styles.examInfo}>Số câu {item.soCau}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <SafeAreaView style={{ flex: 0, backgroundColor: "orange" }} />
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="orange" barStyle="light-content" />

        {/* Header màu cam */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer}>
            <Ionicons name="menu" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kiểm Tra</Text>
          <View style={styles.rightHeader}>
            <TouchableOpacity onPress={searchExams} style={{ marginRight: 15 }}>
              <Ionicons name="search" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={sortExams}>
              <Ionicons name="filter" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Danh sách bài kiểm tra */}
        <FlatList
          data={exams}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderExamItem}
          contentContainerStyle={{ padding: 16 }}
        />

        {/* Nút FAB để tạo bài */}
        <TouchableOpacity style={styles.fab} onPress={onOpenCreateModal}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>

        {/* MODAL TẠO / CHỈNH SỬA */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={onCloseModal}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>
                {isEditing ? "Chỉnh sửa bài" : "Tạo bài mới"}
              </Text>

              {/* TÊN BÀI */}
              <View style={styles.row}>
                <Text style={styles.label}>TÊN BÀI</Text>
                <TextInput
                  style={styles.input}
                  placeholder="VD: TNMaker"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              {/* PHIẾU CHẤM */}
              <View style={styles.row}>
                <Text style={styles.label}>PHIẾU CHẤM</Text>
                <TouchableOpacity
                  style={[styles.input, { justifyContent: "center" }]}
                  onPress={() => setChoosePhieuModalVisible(true)}
                >
                  <Text style={{ color: "#000" }}>{phieu}</Text>
                </TouchableOpacity>
              </View>

              {/* SỐ CÂU */}
              <View style={styles.row}>
                <Text style={styles.label}>SỐ CÂU</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1-120"
                  keyboardType="numeric"
                  value={soCau}
                  onChangeText={(text) => {
                    if (text === "") {
                      setSoCau("");
                      return;
                    }
                    const num = parseInt(text, 10);
                    const max = getMaxSoCau(phieu);
                    if (!isNaN(num) && num >= 1 && num <= max) {
                      setSoCau(String(num));
                    }
                  }}
                />
              </View>

              {/* Nút HỦY / TẠO or LƯU */}
              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: "#ccc" }]}
                  onPress={onCloseModal}
                >
                  <Text style={styles.btnText}>HỦY</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: "orange" }]}
                  onPress={() => {
                    if (isEditing) {
                      onUpdateExam();
                    } else {
                      onCreateExam();
                    }
                  }}
                >
                  <Text style={[styles.btnText, { color: "#fff" }]}>
                    {isEditing ? "LƯU" : "TẠO"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* MODAL CHỌN PHIẾU */}
        <Modal
          visible={choosePhieuModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setChoosePhieuModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={[styles.modalContainer, { width: "80%", maxHeight: "70%" }]}>
              <Text style={styles.modalTitle}>Chọn Phiếu</Text>
              <FlatList
                data={PHIEU_OPTIONS}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.listItem}
                    onPress={() => onChoosePhieu(item)}
                  >
                    <Text>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        {/* MODAL TÙY CHỌN (LONG PRESS) */}
        <Modal
          visible={optionModalVisible}
          transparent
          animationType="slide"
          onRequestClose={onCloseOptionModal}
        >
          <View style={styles.modalBackgroundOption}>
            <View style={styles.optionContainer}>
              {/* Chỉnh sửa */}
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => {
                  if (selectedExam) {
                    onEditExam(selectedExam);
                  }
                  onCloseOptionModal();
                }}
              >
                <Text style={styles.optionText}>Chỉnh sửa</Text>
              </TouchableOpacity>

              {/* Xóa bài */}
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => {
                  if (selectedExam) {
                    onDeleteExam(selectedExam.id);
                  }
                  onCloseOptionModal();
                }}
              >
                <Text style={[styles.optionText, { color: "red" }]}>Xóa bài</Text>
              </TouchableOpacity>

              {/* Hủy */}
              <TouchableOpacity
                style={styles.optionItem}
                onPress={onCloseOptionModal}
              >
                <Text style={styles.optionText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
}

// ==================
//     STYLES
// ==================
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
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "orange",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  examItem: {
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  examTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  examInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  examInfo: {
    fontSize: 14,
    color: "#555",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
    color: "orange",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    width: 100,
    fontWeight: "500",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 8,
    height: 40,
    borderRadius: 4,
  },
  btnRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  btn: {
    minWidth: 60,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginLeft: 10,
    alignItems: "center",
  },
  btnText: {
    fontSize: 16,
    fontWeight: "500",
  },
  listItem: {
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },

  modalBackgroundOption: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  optionContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingVertical: 8,
  },
  optionItem: {
    paddingVertical: 12,
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
