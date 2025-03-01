// examDb.ts
import * as SQLite from "expo-sqlite";

// Mở (hoặc tạo) database "exams.db"
const db = SQLite.openDatabase("exams.db");

// Kiểu dữ liệu 1 bài kiểm tra
export interface ExamItem {
  id: number;
  title: string;
  phieu: string;
  soCau: number;
  date: string; // ví dụ: "28-Thg 2-2025"
}

/** Tạo bảng "exams" nếu chưa tồn tại */
export function createTable() {
  db.transaction(
    (tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS exams (
          id INTEGER PRIMARY KEY NOT NULL,
          title TEXT,
          phieu TEXT,
          soCau INTEGER,
          date TEXT
        );`
      );
    },
    (err) => console.log("Lỗi tạo bảng:", err),
    () => console.log("Tạo bảng 'exams' thành công hoặc đã tồn tại.")
  );
}

/** Thêm 1 bài kiểm tra (INSERT) */
export function addExamToDB(
  id: number,
  title: string,
  phieu: string,
  soCau: number,
  date: string
) {
  return new Promise<void>((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "INSERT INTO exams (id, title, phieu, soCau, date) VALUES (?, ?, ?, ?, ?);",
        [id, title, phieu, soCau, date],
        () => resolve(),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
}

/** Lấy tất cả exam (SELECT) */
export function getAllExamsFromDB(): Promise<ExamItem[]> {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM exams;",
        [],
        (_, { rows }) => {
          resolve(rows._array as ExamItem[]);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
}

/** Cập nhật bài kiểm tra (UPDATE) */
export function updateExamInDB(
  id: number,
  title: string,
  phieu: string,
  soCau: number
) {
  return new Promise<void>((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE exams SET title = ?, phieu = ?, soCau = ? WHERE id = ?;",
        [title, phieu, soCau, id],
        () => resolve(),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
}

/** Xóa 1 bài kiểm tra (DELETE) */
export function deleteExamInDB(id: number) {
  return new Promise<void>((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM exams WHERE id = ?;",
        [id],
        () => resolve(),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
}
