import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

// Import DB hàm
import {
  getAnswersByExamAndCodeAsync,
  removeAnswersOfCodeAsync,
  addAnswerAsync,
} from "../database/examDb";

type TabType = "MA_DE" | "DAP_AN";

const CHOICES = ["A", "B", "C", "D"];
const circleSize = 50;

export default function MaDeAnswersScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  // Nhận params
  const {
    examId = "1",
    soCau = 20,
    mode = "create",   // "create" or "edit"
    oldCode,
    oldAnswers,
  } = route.params || {};

  // Tab
  const [activeTab, setActiveTab] = useState<TabType>("MA_DE");

  // 3 chữ số
  const [digit1, setDigit1] = useState(
    mode === "edit" && oldCode ? oldCode[0] : ""
  );
  const [digit2, setDigit2] = useState(
    mode === "edit" && oldCode ? oldCode[1] : ""
  );
  const [digit3, setDigit3] = useState(
    mode === "edit" && oldCode ? oldCode[2] : ""
  );

  // Đáp án
  const [answers, setAnswers] = useState<Record<number, string>>(
    mode === "edit" && oldAnswers ? oldAnswers : {}
  );

  // Nút back
  const onBack = () => {
    navigation.goBack();
  };

  // Nút Save
  const onSave = async () => {
    const exId = parseInt(examId, 10);
    const newCode = (digit1 || "0") + (digit2 || "0") + (digit3 || "0");

    try {
      if (mode === "create") {
        // Kiểm tra mã đề trùng
        const exist = await getAnswersByExamAndCodeAsync(exId, newCode);
        if (exist.length > 0) {
          Alert.alert("Trùng mã đề", `Mã đề "${newCode}" đã tồn tại!`);
          return;
        }

        // Nếu answers rỗng => thêm 1 dòng "giả" (cauSo=0, dapAn="")
        if (Object.keys(answers).length === 0) {
          await addAnswerAsync(exId, newCode, 0, "");
        } else {
          // Ngược lại, user có chọn 1..n đáp án
          for (const cauSoStr of Object.keys(answers)) {
            const cauSo = parseInt(cauSoStr, 10);
            const dapAn = answers[cauSo];
            await addAnswerAsync(exId, newCode, cauSo, dapAn);
          }
        }

      } else {
        // edit
        if (oldCode && oldCode !== newCode) {
          // Đổi mã đề => kiểm tra trùng
          const exist = await getAnswersByExamAndCodeAsync(exId, newCode);
          if (exist.length > 0) {
            Alert.alert("Trùng mã đề", `Mã đề "${newCode}" đã tồn tại!`);
            return;
          }
          // Xóa oldCode
          await removeAnswersOfCodeAsync(exId, oldCode);
        } else {
          // oldCode == newCode => xóa cũ => ghi đè
          await removeAnswersOfCodeAsync(exId, newCode);
        }

        // Nếu answers rỗng => thêm 1 dòng "giả"
        if (Object.keys(answers).length === 0) {
          await addAnswerAsync(exId, newCode, 0, "");
        } else {
          // Lưu các đáp án
          for (const cauSoStr of Object.keys(answers)) {
            const cauSo = parseInt(cauSoStr, 10);
            const dapAn = answers[cauSo];
            await addAnswerAsync(exId, newCode, cauSo, dapAn);
          }
        }
      }

      navigation.goBack();
    } catch (err) {
      console.log("onSave error:", err);
      Alert.alert("Lỗi", String(err));
    }
  };

  // Chọn tab
  const onSelectTab = (tab: TabType) => setActiveTab(tab);

  // Bấm circle cột 0..3 (Tab MÃ ĐỀ)
  const onPressMaDeCircle = (digit: number, colIndex: number) => {
    if (colIndex === 0) return; // cột 0 => disable
    const label = String(digit);
    if (colIndex === 1) setDigit1(label);
    if (colIndex === 2) setDigit2(label);
    if (colIndex === 3) setDigit3(label);
  };

  // Chọn đáp án (Tab ĐÁP ÁN)
  const onChooseAnswer = (cauSo: number, choice: string) => {
    setAnswers({ ...answers, [cauSo]: choice });
  };

  // ====== UI ======
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.iconButton}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>
        {mode === "edit" ? "Sửa Mã Đề" : "Mã Đề Mới"}
      </Text>
      <TouchableOpacity onPress={onSave} style={styles.iconButton}>
        <Ionicons name="save" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tabItem, activeTab === "MA_DE" && styles.tabItemActive]}
        onPress={() => onSelectTab("MA_DE")}
      >
        <Text style={[styles.tabText, activeTab === "MA_DE" && styles.tabTextActive]}>
          MÃ ĐỀ
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tabItem, activeTab === "DAP_AN" && styles.tabItemActive]}
        onPress={() => onSelectTab("DAP_AN")}
      >
        <Text style={[styles.tabText, activeTab === "DAP_AN" && styles.tabTextActive]}>
          ĐÁP ÁN
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Tab “MÃ ĐỀ”
  const renderMaDeTab = () => {
    // Tạo mảng digits [0..9]
    const digits = Array.from({ length: 10 }, (_, i) => i);

    return (
      <ScrollView contentContainerStyle={styles.maDeTabContainer}>
        <Text style={styles.subTitle}>
          Chọn 3 chữ số (cột 1..3) để tạo mã đề.
        </Text>
        {digits.map((digit) => (
          <View key={digit} style={styles.maDeRow}>
            {[0,1,2,3].map((colIndex) => {
              if (colIndex === 0) {
                // cột 0 => disable
                return (
                  <View
                    key={colIndex}
                    style={[styles.circleDigit, styles.disabledCircle]}
                  >
                    <Text style={styles.circleDigitText}>{digit}</Text>
                  </View>
                );
              } else {
                let selected = false;
                const label = String(digit);
                if (colIndex === 1 && digit1 === label) selected = true;
                if (colIndex === 2 && digit2 === label) selected = true;
                if (colIndex === 3 && digit3 === label) selected = true;

                return (
                  <TouchableOpacity
                    key={colIndex}
                    style={[
                      styles.circleDigit,
                      selected ? styles.selectedCircle : styles.normalCircle,
                    ]}
                    onPress={() => onPressMaDeCircle(digit, colIndex)}
                  >
                    <Text
                      style={[
                        styles.circleDigitText,
                        selected && styles.selectedCircleText,
                      ]}
                    >
                      {digit}
                    </Text>
                  </TouchableOpacity>
                );
              }
            })}
          </View>
        ))}
      </ScrollView>
    );
  };

  // Tab “ĐÁP ÁN”
  const renderDapAnTab = () => {
    // Tạo mảng [1..soCau]
    const data = Array.from({ length: soCau }, (_, i) => i + 1);

    return (
      <ScrollView contentContainerStyle={styles.dapAnTabContainer}>
        <Text style={styles.subTitle}>
          Chọn đáp án (A/B/C/D) cho mỗi câu (1..{soCau}).
        </Text>
        {data.map((cauSo) => {
          const userChoice = answers[cauSo];
          return (
            <View key={cauSo} style={styles.answerRow}>
              <View style={styles.circleSTT}>
                <Text style={styles.circleSTTText}>{cauSo}</Text>
              </View>
              <View style={styles.choiceRow}>
                {CHOICES.map((ch) => {
                  const isSelected = userChoice === ch;
                  return (
                    <TouchableOpacity
                      key={ch}
                      style={[
                        styles.choiceCircle,
                        isSelected && styles.selectedChoice,
                      ]}
                      onPress={() => onChooseAnswer(cauSo, ch)}
                    >
                      <Text
                        style={[
                          styles.choiceText,
                          isSelected && styles.selectedChoiceText,
                        ]}
                      >
                        {ch}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <>
      <SafeAreaView style={{ flex: 0, backgroundColor: "orange" }} />
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="orange" barStyle="light-content" />
        {renderHeader()}
        {renderTabs()}
        <View style={{ flex: 1 }}>
          {activeTab === "MA_DE" ? renderMaDeTab() : renderDapAnTab()}
        </View>
      </SafeAreaView>
    </>
  );
}

/* ========== STYLES ========== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "orange",
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  iconButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },

  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  tabItemActive: {
    borderBottomWidth: 3,
    borderBottomColor: "orange",
  },
  tabText: {
    fontSize: 16,
    color: "#666",
  },
  tabTextActive: {
    color: "orange",
    fontWeight: "600",
  },

  maDeTabContainer: {
    padding: 16,
    alignItems: "center",
  },
  subTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    textAlign: "center",
  },
  maDeRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
    width: "80%",
  },
  circleDigit: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledCircle: {
    backgroundColor: "#b2b2b2",
  },
  normalCircle: {
    backgroundColor: "#9aa9e1",
  },
  selectedCircle: {
    backgroundColor: "orange",
  },
  circleDigitText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  selectedCircleText: {
    color: "#fff",
  },

  dapAnTabContainer: {
    padding: 16,
  },
  answerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  circleSTT: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e6e6e6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  circleSTTText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
  },
  choiceRow: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-around",
  },
  choiceCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  choiceText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  selectedChoice: {
    backgroundColor: "orange",
  },
  selectedChoiceText: {
    color: "#fff",
  },
});
