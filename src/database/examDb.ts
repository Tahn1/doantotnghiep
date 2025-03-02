// examDb.ts
import * as SQLite from 'expo-sqlite';

/** Kiểu dữ liệu 1 bài kiểm tra */
export interface ExamItem {
  id: number;
  title: string;
  phieu: string;
  soCau: number;
  date: string; 
}

/** Biến toàn cục giữ database (để tái sử dụng) */
let db: SQLite.SQLiteDatabase | null = null;

/**
 * Mở (hoặc tạo) database, tạo bảng nếu chưa có.
 * Sử dụng API async 
 */
export async function openDbAsync(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    // Hàm mới: openDatabaseAsync
    db = await SQLite.openDatabaseAsync('exams.db');

    // Tạo bảng 'exams' nếu chưa có
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS exams (
        id INTEGER PRIMARY KEY NOT NULL,
        title TEXT,
        phieu TEXT,
        soCau INTEGER,
        date TEXT
      );
    `);
  }
  return db;
}

/** Lấy toàn bộ bài kiểm tra (SELECT * FROM exams) */
export async function getAllExamsAsync(): Promise<ExamItem[]> {
  const database = await openDbAsync();
  // getAllAsync<T> => trả về mảng T
  const rows = await database.getAllAsync<ExamItem>(
    'SELECT * FROM exams ORDER BY id DESC'
  );
  return rows;
}

/** Thêm 1 bài kiểm tra */
export async function addExamAsync(exam: ExamItem): Promise<void> {
  const database = await openDbAsync();
  await database.runAsync(
    'INSERT INTO exams (id, title, phieu, soCau, date) VALUES (?, ?, ?, ?, ?)',
    exam.id,
    exam.title,
    exam.phieu,
    exam.soCau,
    exam.date
  );
}

/** Cập nhật bài kiểm tra */
export async function updateExamAsync(
  examId: number,
  newTitle: string,
  newPhieu: string,
  newSoCau: number
): Promise<void> {
  const database = await openDbAsync();
  await database.runAsync(
    'UPDATE exams SET title = ?, phieu = ?, soCau = ? WHERE id = ?',
    newTitle,
    newPhieu,
    newSoCau,
    examId
  );
}

/** Xóa bài kiểm tra */
export async function deleteExamAsync(examId: number): Promise<void> {
  const database = await openDbAsync();
  await database.runAsync(
    'DELETE FROM exams WHERE id = ?',
    examId
  );
}
