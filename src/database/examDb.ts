// src/database/examDb.ts
import * as SQLite from 'expo-sqlite';

/** Kiểu dữ liệu 1 bài kiểm tra */
export interface ExamItem {
  id: number;
  title: string;
  phieu: string;
  soCau: number;
  date: string;
}

/** Kiểu dữ liệu 1 dòng đáp án */
export interface AnswerItem {
  id: number;       // PRIMARY KEY
  examId: number;   // FK -> exams.id
  code: string;     // Mã đề
  cauSo: number;    // Số thứ tự câu
  dapAn: string;    // A/B/C/D
}

/** Biến toàn cục giữ database (để tái sử dụng) */
let db: SQLite.SQLiteDatabase | null = null;

/**
 * Mở (hoặc tạo) database, tạo bảng nếu chưa có.
 * Sử dụng API async 
 */
export async function openDbAsync(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
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

    // Tạo bảng 'answers' nếu chưa có
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS answers (
        id INTEGER PRIMARY KEY NOT NULL,
        examId INTEGER,
        code TEXT,
        cauSo INTEGER,
        dapAn TEXT
      );
    `);
  }
  return db;
}

/** Lấy toàn bộ bài kiểm tra (SELECT * FROM exams) */
export async function getAllExamsAsync(): Promise<ExamItem[]> {
  const database = await openDbAsync();
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

/* ==========================
   THÊM CHỨC NĂNG LƯU ĐÁP ÁN
   BẢNG 'answers'
========================== */

/** Thêm 1 dòng đáp án cho examId + code + cauSo + dapAn */
export async function addAnswerAsync(
  examId: number,
  code: string,
  cauSo: number,
  dapAn: string
): Promise<void> {
  const database = await openDbAsync();
  await database.runAsync(
    'INSERT INTO answers (examId, code, cauSo, dapAn) VALUES (?, ?, ?, ?)',
    examId,
    code,
    cauSo,
    dapAn
  );
}

/** Lấy tất cả đáp án của 1 exam */
export async function getAnswersByExamAsync(examId: number): Promise<AnswerItem[]> {
  const database = await openDbAsync();
  const rows = await database.getAllAsync<AnswerItem>(
    'SELECT * FROM answers WHERE examId = ? ORDER BY code, cauSo',
    examId
  );
  return rows;
}

/** Lấy đáp án theo exam + mã đề */
export async function getAnswersByExamAndCodeAsync(
  examId: number,
  code: string
): Promise<AnswerItem[]> {
  const database = await openDbAsync();
  const rows = await database.getAllAsync<AnswerItem>(
    'SELECT * FROM answers WHERE examId = ? AND code = ? ORDER BY cauSo',
    examId,
    code
  );
  return rows;
}

/** Xóa toàn bộ đáp án của 1 mã đề */
export async function removeAnswersOfCodeAsync(
  examId: number,
  code: string
): Promise<void> {
  const database = await openDbAsync();
  await database.runAsync(
    'DELETE FROM answers WHERE examId = ? AND code = ?',
    examId,
    code
  );
}

/** Update đáp án 1 dòng (nếu cần) */
export async function updateAnswerAsync(
  answerId: number,
  newDapAn: string
): Promise<void> {
  const database = await openDbAsync();
  await database.runAsync(
    'UPDATE answers SET dapAn = ? WHERE id = ?',
    newDapAn,
    answerId
  );
}

/**
 * Hàm loadMaDe(examId) => trả về mảng { examId, code, answers }[].
 * - Group theo code
 * - answers: { [cauSo]: dapAn }
 */
export async function loadMaDe(examId: string): Promise<{ examId: string; code: string; answers: Record<number, string>; }[]> {
  const database = await openDbAsync();

  // Chuyển examId thành number nếu cần
  const exId = parseInt(examId, 10);

  // Lấy toàn bộ rows
  const rows = await database.getAllAsync<AnswerItem>(
    'SELECT * FROM answers WHERE examId = ? ORDER BY code, cauSo',
    exId
  );

  // Gom theo code
  const map: Record<string, Record<number, string>> = {};
  for (const r of rows) {
    if (!map[r.code]) {
      map[r.code] = {};
    }
    map[r.code][r.cauSo] = r.dapAn;
  }

  // Tạo mảng kết quả
  const result: { examId: string; code: string; answers: Record<number, string>; }[] = [];
  for (const code of Object.keys(map)) {
    result.push({
      examId,
      code,
      answers: map[code],
    });
  }

  return result;
}
