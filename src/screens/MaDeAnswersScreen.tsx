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

import {
  getAnswersByExamAndCodeAsync,
  removeAnswersOfCodeAsync,
  addAnswerAsync,
} from "../database/examDb";

type TabType = "MA_DE" | "DAP_AN";

const ROWS = Array.from({ length: 10 }, (_, i) => i);
const CHOICES = ["A", "B", "C", "D"];

export default function MaDeAnswersScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const {
    examId = "1",
    mode = "create", // "create" or "edit"
    oldCode, // mã đề cũ nếu edit
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

  // Lưu
  const onSave = async () => {
    const exId = parseInt(examId, 10);
    const newCode = (digit1 || "0") + (digit2 || "0") + (digit3 || "0");

    try {
      if (mode === "create") {
        // Kiểm tra trùng
        const exist = await getAnswersByExamAndCodeAsync(exId, newCode);
        if (exist.length > 0) {
          Alert.alert("Trùng mã đề", `Mã đề "${newCode}" đã tồn tại!`);
          return;
        }
        // Lưu
        // for each cauSo in answers => addAnswerAsync
        for (const cauSoStr of Object.keys(answers)) {
          const cauSo = parseInt(cauSoStr, 10);
          const dapAn = answers[cauSo];
          await addAnswerAsync(exId, newCode, cauSo, dapAn);
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
          // oldCode==newCode => ghi đè
          await removeAnswersOfCodeAsync(exId, newCode);
        }
        // Lưu newCode
        for (const cauSoStr of Object.keys(answers)) {
          const cauSo = parseInt(cauSoStr, 10);
          const dapAn = answers[cauSo];
          await addAnswerAsync(exId, newCode, cauSo, dapAn);
        }
      }

      navigation.goBack();
    } catch (err) {
      console.log("onSave error:", err);
      Alert.alert("Lỗi", String(err));
    }
  };

  // Tab
  const onSelectTab = (tab: TabType) => setActiveTab(tab);

  // Bấm circle cột 0..3
  const onPressMaDeCircle = (rowIndex: number, colIndex: number) => {
    if (colIndex === 0) return;
    const label = String(rowIndex);
    if (colIndex === 1) setDigit1(label);
    if (colIndex === 2) setDigit2(label);
    if (colIndex === 3) setDigit3(label);
  };

  const onChooseAnswer = (cauSo: number, choice: string) => {
    setAnswers({
      ...answers,
      [cauSo]: choice,
    });
  };

  // UI
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.iconButton}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>
        {mode === "edit" ? "Sửa mã đề" : "Mã đề mới"}
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
        <Text
          style={[
            styles.tabText,
            activeTab === "MA_DE" && styles.tabTextActive,
          ]}
        >
          MÃ ĐỀ
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tabItem, activeTab === "DAP_AN" && styles.tabItemActive]}
        onPress={() => onSelectTab("DAP_AN")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "DAP_AN" && styles.tabTextActive,
          ]}
        >
          ĐÁP ÁN
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderMaDeTab = () => {
    const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {digits.map((rowIndex) => (
          <View key={rowIndex} style={styles.maDeRow}>
            {[0, 1, 2, 3].map((colIndex) => {
              if (colIndex === 0) {
                // cột 0 => disable
                return (
                  <TouchableOpacity
                    key={colIndex}
                    style={[styles.maDeCircle, { backgroundColor: "#b2b2b2" }]}
                    activeOpacity={1}
                  >
                    <Text style={styles.maDeCircleText}>{rowIndex}</Text>
                  </TouchableOpacity>
                );
              } else {
                let selected = false;
                const label = String(rowIndex);
                if (colIndex === 1 && digit1 === label) selected = true;
                if (colIndex === 2 && digit2 === label) selected = true;
                if (colIndex === 3 && digit3 === label) selected = true;
                let bg = "#9aa9e1";
                if (selected) bg = "orange";
                return (
                  <TouchableOpacity
                    key={colIndex}
                    style={[styles.maDeCircle, { backgroundColor: bg }]}
                    onPress={() => onPressMaDeCircle(rowIndex, colIndex)}
                  >
                    <Text
                      style={[
                        styles.maDeCircleText,
                        selected && { color: "#fff" },
                      ]}
                    >
                      {rowIndex}
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

  const DEMO_SOCAU = 13;
  const renderDapAnTab = () => {
    const data = Array.from({ length: DEMO_SOCAU }, (_, i) => i + 1);
    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
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
                        isSelected && { backgroundColor: "orange" },
                      ]}
                      onPress={() => onChooseAnswer(cauSo, ch)}
                    >
                      <Text
                        style={[
                          styles.choiceText,
                          isSelected && { color: "#fff" },
                        ]}
                      >
                        {ch}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={styles.emptyColumn} />
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

const circleSize = 48;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "orange",
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  iconButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },

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
    borderBottomWidth: 2,
    borderBottomColor: "orange",
  },
  tabText: { fontSize: 16, color: "#666" },
  tabTextActive: { color: "orange", fontWeight: "600" },

  maDeRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  maDeCircle: {
    width: circleSize,
    height: circleSize,
    borderRadius: circleSize / 2,
    backgroundColor: "#9aa9e1",
    alignItems: "center",
    justifyContent: "center",
  },
  maDeCircleText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
  },

  answerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  circleSTT: {
    width: circleSize,
    height: circleSize,
    borderRadius: circleSize / 2,
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
    marginRight: 12,
  },
  choiceCircle: {
    width: circleSize,
    height: circleSize,
    borderRadius: circleSize / 2,
    backgroundColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  choiceText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  emptyColumn: {
    width: circleSize,
  },
});
