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

// Import hàm SQLite
import {
  createTable,
  addExamToDB,
  getAllExamsFromDB,
  updateExamInDB,
  deleteExamInDB,
  ExamItem,
} from "../database/examDb"; // Điều chỉnh đường dẫn cho đúng

// Danh sách phiếu
const PHIEU_OPTIONS = ["Phiếu 20", "Phiếu 60", "Phiếu 120"];

// Hàm trả về số câu tối đa dựa theo phiếu
function getMaxSoCau(phieu: string): number {
  if (phieu === "Phiếu 120") return 120;
  if (phieu === "Phiếu 60") return 60;
  if (phieu === "Phiếu 20") return 20;
  return 120; // Mặc định
}

// Hàm parse dateString "28-Thg 2-2025" -> đối tượng Date để sắp xếp
function parseDateString(dateString: string): Date {
  // Giả sử dateString dạng "28-Thg 2-2025"
  // Tách dayPart và "2-2025"
  const [dayPart, rest] = dateString.split("-Thg ");
  if (!rest) return new Date(); // fallback
  const [monthStr, yearStr] = rest.split("-");
  const day = parseInt(dayPart, 10);
  const month = parseInt(monthStr, 10);
  const year = parseInt(yearStr, 10);
  return new Date(year, month - 1, day);
}

// Kiểu sort
type SortOption = "none" | "dateAsc" | "dateDesc" | "titleAsc" | "titleDesc";

export default function KiemTraScreen() {
  const navigation = useNavigation();

  // ==================
  //   STATE DB & UI
  // ==================
  const [exams, setExams] = useState<ExamItem[]>([]);

  // Tạo / Chỉnh sửa
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [phieu, setPhieu] = useState("Phiếu 20");
  const [soCau, setSoCau] = useState("20");
  const [isEditing, setIsEditing] = useState(false);
  const [editingExamId, setEditingExamId] = useState<number | null>(null);

  // Chọn phiếu
  const [choosePhieuModalVisible, setChoosePhieuModalVisible] = useState(false);

  // Tùy chọn (long press)
  const [optionModalVisible, setOptionModalVisible] = useState(false);
  const [selectedExam, setSelectedExam] = useState<ExamItem | null>(null);

  // ==================
  //   SEARCH & SORT
  // ==================
  const [searchMode, setSearchMode] = useState(false); // ẩn/hiện ô tìm kiếm
  const [searchText, setSearchText] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("none");
  const [sortModalVisible, setSortModalVisible] = useState(false);

  // ==================
  //   KHỞI TẠO DB
  // ==================
  useEffect(() => {
    createTable(); // Tạo bảng nếu chưa có
    loadExamsFromDB(); // Tải danh sách ban đầu
  }, []);

  // Hàm load exam từ DB
  const loadExamsFromDB = async () => {
    try {
      const list = await getAllExamsFromDB();
      setExams(list);
    } catch (error) {
      console.log("Lỗi loadExamsFromDB:", error);
    }
  };

  // ==================
  //   XỬ LÝ SEARCH + SORT
  // ==================

  /** Lọc + sắp xếp exams theo searchText + sortOption */
  function getFilteredAndSortedExams() {
    // 1. Filter
    let data = exams;
    if (searchText.trim() !== "") {
      const lower = searchText.trim().toLowerCase();
      data = data.filter((item) => item.title.toLowerCase().includes(lower));
    }

    // 2. Sort
    if (sortOption === "dateAsc") {
      data = [...data].sort(
        (a, b) =>
          parseDateString(a.date).getTime() - parseDateString(b.date).getTime()
      );
    } else if (sortOption === "dateDesc") {
      data = [...data].sort(
        (a, b) =>
          parseDateString(b.date).getTime() - parseDateString(a.date).getTime()
      );
    } else if (sortOption === "titleAsc") {
      data = [...data].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === "titleDesc") {
      data = [...data].sort((a, b) => b.title.localeCompare(a.title));
    }
    return data;
  }

  // ==================
  //   HEADER
  // ==================
  const openDrawer = () => {
    navigation.openDrawer();
  };

  /** Bấm nút search => toggle searchMode */
  const handleSearchToggle = () => {
    // Nếu tắt searchMode, reset searchText
    if (searchMode) {
      setSearchText("");
    }
    setSearchMode(!searchMode);
  };

  /** Mở modal sort */
  const handleSortToggle = () => {
    setSortModalVisible(true);
  };

  // ==================
  //   TẠO / CHỈNH SỬA
  // ==================
  const onOpenCreateModal = () => {
    setIsEditing(false);
    setEditingExamId(null);
    setTitle("");
    setPhieu("Phiếu 20");
    setSoCau("20");
    setModalVisible(true);
  };

  const onCloseModal = () => {
    setModalVisible(false);
    setIsEditing(false);
    setEditingExamId(null);
    setTitle("");
    setPhieu("Phiếu 20");
    setSoCau("20");
  };

  /** Tạo bài kiểm tra (INSERT) */
  const onCreateExam = async () => {
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
      Alert.alert(
        "Lỗi",
        `Số câu phải từ 1 đến ${maxCau} (vì bạn chọn ${phieu})!`
      );
      return;
    }

    // Tạo dateString
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const dateString = `${day}-Thg ${month}-${year}`;

    // Dùng Date.now() làm id
    const newId = Date.now();

    try {
      await addExamToDB(newId, title.trim(), phieu, numSoCau, dateString);
      onCloseModal();
      loadExamsFromDB();
    } catch (error) {
      console.log("Lỗi onCreateExam:", error);
      Alert.alert("Lỗi", "Không thể thêm bài kiểm tra!");
    }
  };

  /** Mở modal chỉnh sửa */
  const onEditExam = (exam: ExamItem) => {
    setIsEditing(true);
    setEditingExamId(exam.id);
    setTitle(exam.title);
    setPhieu(exam.phieu);
    setSoCau(String(exam.soCau));
    setModalVisible(true);
  };

  /** Lưu bài kiểm tra sau khi chỉnh sửa (UPDATE) */
  const onUpdateExam = async () => {
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
      Alert.alert(
        "Lỗi",
        `Số câu phải từ 1 đến ${maxCau} (vì bạn chọn ${phieu})!`
      );
      return;
    }

    try {
      await updateExamInDB(editingExamId, title.trim(), phieu, numSoCau);
      onCloseModal();
      loadExamsFromDB();
    } catch (error) {
      console.log("Lỗi onUpdateExam:", error);
      Alert.alert("Lỗi", "Không thể cập nhật bài kiểm tra!");
    }
  };

  // ==================
  //   XÓA
  // ==================
  const onDeleteExam = async (examId: number) => {
    try {
      await deleteExamInDB(examId);
      loadExamsFromDB();
    } catch (error) {
      console.log("Lỗi onDeleteExam:", error);
      Alert.alert("Lỗi", "Không thể xóa bài kiểm tra!");
    }
  };

  // ==================
  //   CHỌN PHIẾU
  // ==================
  const onChoosePhieu = (value: string) => {
    setPhieu(value);
    const max = getMaxSoCau(value);
    setSoCau(String(max));
    setChoosePhieuModalVisible(false);
  };

  // ==================
  //   TÙY CHỌN (LONG PRESS)
  // ==================
  const onLongPressExam = (exam: ExamItem) => {
    setSelectedExam(exam);
    setOptionModalVisible(true);
  };
  const onCloseOptionModal = () => {
    setSelectedExam(null);
    setOptionModalVisible(false);
  };

  // ==================
  //   RENDER ITEM
  // ==================
  const renderExamItem = ({ item }: { item: ExamItem }) => {
    return (
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
  };

  // Mảng hiển thị sau khi áp dụng search + sort
  const displayExams = getFilteredAndSortedExams();

  // ==================
  //   GIAO DIỆN
  // ==================
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

          {/* Nút Search + Sort ở bên phải */}
          <View style={styles.rightHeader}>
            {/* Nếu searchMode = true => hiển thị ô nhập, nếu không thì hiển thị icon */}
            {searchMode ? (
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm theo tên..."
                placeholderTextColor="#ccc"
                value={searchText}
                onChangeText={setSearchText}
              />
            ) : null}

            {/* Nút toggle search */}
            <TouchableOpacity
              onPress={handleSearchToggle}
              style={{ marginHorizontal: 8 }}
            >
              <Ionicons
                name={searchMode ? "close-circle" : "search"}
                size={24}
                color="#fff"
              />
            </TouchableOpacity>

            {/* Nút mở modal sort */}
            <TouchableOpacity onPress={handleSortToggle}>
              <Ionicons name="filter" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Danh sách bài kiểm tra (sau filter + sort) */}
        <FlatList
          data={displayExams}
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
            <View
              style={[
                styles.modalContainer,
                { width: "80%", maxHeight: "70%" },
              ]}
            >
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
                <Text style={[styles.optionText, { color: "red" }]}>
                  Xóa bài
                </Text>
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

        {/* MODAL SORT */}
        <Modal
          visible={sortModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setSortModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={[styles.modalContainer, { width: "80%" }]}>
              <Text style={styles.modalTitle}>Sắp xếp</Text>

              {/* Tên A-Z */}
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => {
                  setSortOption("titleAsc");
                  setSortModalVisible(false);
                }}
              >
                <Text>Tên (A → Z)</Text>
              </TouchableOpacity>
              {/* Tên Z-A */}
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => {
                  setSortOption("titleDesc");
                  setSortModalVisible(false);
                }}
              >
                <Text>Tên (Z → A)</Text>
              </TouchableOpacity>
              {/* Ngày cũ → mới */}
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => {
                  setSortOption("dateAsc");
                  setSortModalVisible(false);
                }}
              >
                <Text>Ngày (cũ → mới)</Text>
              </TouchableOpacity>
              {/* Ngày mới → cũ */}
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => {
                  setSortOption("dateDesc");
                  setSortModalVisible(false);
                }}
              >
                <Text>Ngày (mới → cũ)</Text>
              </TouchableOpacity>
              {/* Bỏ sắp xếp */}
              <TouchableOpacity
                style={[styles.listItem, { backgroundColor: "#eee" }]}
                onPress={() => {
                  setSortOption("none");
                  setSortModalVisible(false);
                }}
              >
                <Text>Bỏ sắp xếp</Text>
              </TouchableOpacity>

              {/* Nút đóng */}
              <TouchableOpacity
                style={[styles.btn, { alignSelf: "center", marginTop: 12 }]}
                onPress={() => setSortModalVisible(false)}
              >
                <Text style={styles.btnText}>Đóng</Text>
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
  searchInput: {
    width: 150,
    height: 35,
    backgroundColor: "#fff",
    borderRadius: 6,
    paddingHorizontal: 8,
    color: "#000",
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
    backgroundColor: "#ccc",
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

  // Modal tùy chọn (long press)
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
