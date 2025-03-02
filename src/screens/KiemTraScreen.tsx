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

// Import hàm async (giống code cũ)
import {
  ExamItem,
  getAllExamsAsync,
  addExamAsync,
  updateExamAsync,
  deleteExamAsync,
} from "../database/examDb";

// Danh sách phiếu (giữ nguyên)
const PHIEU_OPTIONS = ["Phiếu 20", "Phiếu 60", "Phiếu 120"];

// Hàm trả về số câu tối đa (giữ nguyên)
function getMaxSoCau(phieu: string): number {
  if (phieu === "Phiếu 120") return 120;
  if (phieu === "Phiếu 60") return 60;
  if (phieu === "Phiếu 20") return 20;
  return 120;
}

function parseDateString(dateString: string): number {
  const [dayStr, rest] = dateString.split("-Thg ");
  if (!rest) return 0;
  const [monthStr, yearStr] = rest.split("-");
  const day = parseInt(dayStr, 10);
  const month = parseInt(monthStr, 10);
  const year = parseInt(yearStr, 10);
  return new Date(year, month - 1, day).getTime();
}

/** Lọc (searchText) + sắp xếp (sortOption) */
function getFilteredAndSortedExams(
  exams: ExamItem[],
  searchText: string,
  sortOption: string
): ExamItem[] {
  let data = exams;
  // 1. Tìm kiếm
  const keyword = searchText.trim().toLowerCase();
  if (keyword) {
    data = data.filter((exam) =>
      exam.title.toLowerCase().includes(keyword)
    );
  }
  // 2. Sắp xếp
  switch (sortOption) {
    case "dateAsc":
      data = [...data].sort(
        (a, b) => parseDateString(a.date) - parseDateString(b.date)
      );
      break;
    case "dateDesc":
      data = [...data].sort(
        (a, b) => parseDateString(b.date) - parseDateString(a.date)
      );
      break;
    case "titleAsc":
      data = [...data].sort((a, b) =>
        a.title.localeCompare(b.title, "vi", { sensitivity: "base" })
      );
      break;
    case "titleDesc":
      data = [...data].sort((a, b) =>
        b.title.localeCompare(a.title, "vi", { sensitivity: "base" })
      );
      break;
    default:
      // 'none'
      break;
  }
  return data;
}

export default function KiemTraScreen() {
  const navigation = useNavigation();

  // Danh sách các bài kiểm tra
  const [exams, setExams] = useState<ExamItem[]>([]);

  // Tìm kiếm
  const [searchText, setSearchText] = useState("");
  // Sắp xếp: 'none' | 'dateAsc' | 'dateDesc' | 'titleAsc' | 'titleDesc'
  const [sortOption, setSortOption] = useState("none");
  // Modal sắp xếp
  const [sortModalVisible, setSortModalVisible] = useState(false);

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

  // Tạo danh sách hiển thị sau search + sort
  const displayExams = getFilteredAndSortedExams(exams, searchText, sortOption);

  // Mở Drawer
  const openDrawer = () => {
    navigation.openDrawer();
  };

  // Toggle modal sort
  const openSortModal = () => {
    setSortModalVisible(true);
  };

  // Demo searchExams => giờ ta dùng searchText thay
  const searchExams = () => {
    Alert.alert("Search", "Hãy nhập từ khoá ở thanh trên cùng!");
  };

  // SortExams => mở modal
  const sortExams = () => {
    openSortModal();
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
    // ... (như code cũ)
  }

  // Mở modal Chỉnh sửa
  const onEditExam = (exam: ExamItem) => {
    // ... (như code cũ)
  };

  // Lưu bài kiểm tra sau khi chỉnh sửa
  async function onUpdateExam() {
    // ... (như code cũ)
  }

  // Xoá bài
  async function onDeleteExam(examId: number) {
    // ... (như code cũ)
  }

  // Chọn phiếu
  const onChoosePhieu = (value: string) => {
    // ... (như code cũ)
  };

  // Mở modal tuỳ chọn (long press)
  const onLongPressExam = (exam: ExamItem) => {
    // ... (như code cũ)
  };
  const onCloseOptionModal = () => {
    // ... (như code cũ)
  };

  // Render 1 item
  const renderExamItem = ({ item }: { item: ExamItem }) => (
    // ... (như code cũ)
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

          {/* Ô tìm kiếm + Nút filter */}
          <View style={styles.rightHeader}>
            {/* Ô nhập searchText */}
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm theo tên..."
              placeholderTextColor="#ccc"
              value={searchText}
              onChangeText={setSearchText}
            />
            {/* Nút mở modal sắp xếp */}
            <TouchableOpacity onPress={sortExams} style={{ marginLeft: 8 }}>
              <Ionicons name="filter" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Danh sách (đã lọc + sắp xếp) */}
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

        {/* MODAL TẠO / CHỈNH SỬA (giống code cũ) */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={onCloseModal}
        >
          {/* ... */}
        </Modal>

        {/* MODAL CHỌN PHIẾU (giống code cũ) */}
        <Modal
          visible={choosePhieuModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setChoosePhieuModalVisible(false)}
        >
          {/* ... */}
        </Modal>

        {/* MODAL TÙY CHỌN (long press) (giống code cũ) */}
        <Modal
          visible={optionModalVisible}
          transparent
          animationType="slide"
          onRequestClose={onCloseOptionModal}
        >
          {/* ... */}
        </Modal>

        {/* MODAL SẮP XẾP */}
        <Modal
          visible={sortModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setSortModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={[styles.modalContainer, { width: "80%" }]}>
              <Text style={styles.modalTitle}>Sắp xếp</Text>

              <TouchableOpacity
                style={styles.listItem}
                onPress={() => {
                  setSortOption("dateAsc");
                  setSortModalVisible(false);
                }}
              >
                <Text>Ngày (cũ → mới)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.listItem}
                onPress={() => {
                  setSortOption("dateDesc");
                  setSortModalVisible(false);
                }}
              >
                <Text>Ngày (mới → cũ)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.listItem}
                onPress={() => {
                  setSortOption("titleAsc");
                  setSortModalVisible(false);
                }}
              >
                <Text>Tên (A → Z)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.listItem}
                onPress={() => {
                  setSortOption("titleDesc");
                  setSortModalVisible(false);
                }}
              >
                <Text>Tên (Z → A)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.listItem, { backgroundColor: "#eee" }]}
                onPress={() => {
                  setSortOption("none");
                  setSortModalVisible(false);
                }}
              >
                <Text>Bỏ sắp xếp</Text>
              </TouchableOpacity>

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
    width: 130,
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
  listItem: {
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
  btn: {
    backgroundColor: "#ccc",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  btnText: {
    fontSize: 16,
    fontWeight: "500",
  },
  // ...
});
