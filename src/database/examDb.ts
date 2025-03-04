// src/database/examDb.ts
import * as SQLite from 'expo-sqlite';

/** Kiểu dữ liệu 1 bài kiểm tra (cơ bản) */
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

/** Kiểu dữ liệu stats (chỉ 1 row cho mỗi examId) */
export interface ExamStatsItem {
  examId: number;        // PRIMARY KEY, trùng examId
  soBaiCham: number;     // mặc định 0
  soDapAn: number;       // = số mã đề (distinct code)
  diemTrungBinh: number; // mặc định 0.0
  diemThapNhat: number;  // mặc định 0.0
  diemCaoNhat: number;   // mặc định 0.0
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

    // Bảng 'exams'
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS exams (
        id INTEGER PRIMARY KEY NOT NULL,
        title TEXT,
        phieu TEXT,
        soCau INTEGER,
        date TEXT
      );
    `);

    // Bảng 'answers'
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS answers (
        id INTEGER PRIMARY KEY NOT NULL,
        examId INTEGER,
        code TEXT,
        cauSo INTEGER,
        dapAn TEXT
      );
    `);

    // Bảng 'exam_stats'
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS exam_stats (
        examId INTEGER PRIMARY KEY NOT NULL,
        soBaiCham INTEGER DEFAULT 0,
        soDapAn INTEGER DEFAULT 0,
        diemTrungBinh REAL DEFAULT 0.0,
        diemThapNhat REAL DEFAULT 0.0,
        diemCaoNhat REAL DEFAULT 0.0
      );
    `);
  }
  return db;
}

/** 
 * ========== HÀM LẤY/CẬP NHẬT BẢNG exams ==========
 */

/** Lấy toàn bộ bài kiểm tra */
export async function getAllExamsAsync(): Promise<ExamItem[]> {
  const database = await openDbAsync();
  const rows = await database.getAllAsync<ExamItem>(
    'SELECT * FROM exams ORDER BY id DESC'
  );
  return rows;
}

/** Thêm 1 bài kiểm tra (lúc chưa chấm => cột stats = 0) */
export async function addExamAsync(exam: ExamItem): Promise<void> {
  const database = await openDbAsync();
  // Thêm exam
  await database.runAsync(
    'INSERT INTO exams (id, title, phieu, soCau, date) VALUES (?, ?, ?, ?, ?)',
    exam.id,
    exam.title,
    exam.phieu,
    exam.soCau,
    exam.date
  );

  // Tạo 1 row exam_stats = 0
  await database.runAsync(
    `INSERT INTO exam_stats (
       examId, soBaiCham, soDapAn, diemTrungBinh, diemThapNhat, diemCaoNhat
     ) VALUES (?, 0, 0, 0.0, 0.0, 0.0)`,
    exam.id
  );
}

/** Cập nhật bài kiểm tra (title, phieu, soCau) */
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

/** Xóa bài kiểm tra (và xóa exam_stats, answers) */
export async function deleteExamAsync(examId: number): Promise<void> {
  const database = await openDbAsync();
  // Xóa exam
  await database.runAsync('DELETE FROM exams WHERE id = ?', examId);
  // Xóa stats
  await database.runAsync('DELETE FROM exam_stats WHERE examId = ?', examId);
  // Xóa answers
  await database.runAsync('DELETE FROM answers WHERE examId = ?', examId);
}

/* ==========================
   BẢNG 'answers' (mã đề)
========================== */

/** Thêm 1 dòng đáp án => Tự động cập nhật soDapAn */
export async function addAnswerAsync(
  examId: number,
  code: string,
  cauSo: number,
  dapAn: string
): Promise<void> {
  const database = await openDbAsync();
  // Thêm 1 dòng
  await database.runAsync(
    'INSERT INTO answers (examId, code, cauSo, dapAn) VALUES (?, ?, ?, ?)',
    examId,
    code,
    cauSo,
    dapAn
  );

  // Tự động update soDapAn
  await updateSoDapAnAsync(examId);
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

/** Xóa toàn bộ đáp án của 1 mã đề => Tự động cập nhật soDapAn */
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

  // Tự động update soDapAn
  await updateSoDapAnAsync(examId);
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

  const exId = parseInt(examId, 10);
  const rows = await database.getAllAsync<AnswerItem>(
    'SELECT * FROM answers WHERE examId = ? ORDER BY code, cauSo',
    exId
  );

  const map: Record<string, Record<number, string>> = {};
  for (const r of rows) {
    if (!map[r.code]) {
      map[r.code] = {};
    }
    map[r.code][r.cauSo] = r.dapAn;
  }

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

/* ==========================
   BẢNG exam_stats
   LƯU THÔNG TIN SAU KHI CHẤM
========================== */

/** Lấy 1 row exam_stats (nếu cần) */
export async function getExamStatsAsync(examId: number): Promise<ExamStatsItem | null> {
  const database = await openDbAsync();
  const row = await database.getFirstAsync<ExamStatsItem>(
    `SELECT
       examId,
       soBaiCham,
       soDapAn,
       diemTrungBinh,
       diemThapNhat,
       diemCaoNhat
     FROM exam_stats
     WHERE examId = ?`,
    examId
  );
  return row || null;
}

/** Update exam_stats (soBaiCham, soDapAn, diemTrungBinh, diemThapNhat, diemCaoNhat) */
export async function updateExamStatsAsync(
  examId: number,
  soBaiCham: number,
  soDapAn: number,
  diemTrungBinh: number,
  diemThapNhat: number,
  diemCaoNhat: number
): Promise<void> {
  const database = await openDbAsync();
  await database.runAsync(
    `UPDATE exam_stats
     SET
       soBaiCham=?,
       soDapAn=?,
       diemTrungBinh=?,
       diemThapNhat=?,
       diemCaoNhat=?
     WHERE examId=?`,
    soBaiCham,
    soDapAn,
    diemTrungBinh,
    diemThapNhat,
    diemCaoNhat,
    examId
  );
}

/** Tính soDapAn = số mã đề distinct trong answers => update exam_stats */
export async function updateSoDapAnAsync(examId: number): Promise<void> {
  const database = await openDbAsync();
  // Đếm distinct code
  const row = await database.getFirstAsync<{ count: number }>(
    `SELECT COUNT(DISTINCT code) as count
     FROM answers
     WHERE examId = ?`,
    examId
  );
  const soDapAn = row ? row.count : 0;

  // Cập nhật exam_stats
  await database.runAsync(
    `UPDATE exam_stats
     SET soDapAn = ?
     WHERE examId = ?`,
    soDapAn,
    examId
  );
}

