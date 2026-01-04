import db from '../../config/firebase.config';
import { ServiceResponse } from '../../common/models/serviceResponse';
import { StatusCodes } from 'http-status-codes';

class AnalyticsService {
  private submissionsRef = db.collection('submissions');
  private sentimentsRef = db.collection('sentiments');
  private coursesRef = db.collection('courses');
  private materialsRef = db.collection('materials');

  // ======================================================
  // 1. SENTIMEN (FEEDBACK SISWA)
  // ======================================================
  async submitSentiment(userId: string, data: any) {
    // Cek duplikasi: Satu siswa hanya boleh kasih 1 feedback per materi
    const id = `${userId}_${data.materialId}`;

    await this.sentimentsRef.doc(id).set({
      ...data,
      userId,
      createdAt: new Date(),
    });

    return ServiceResponse.success(
      'Terima kasih atas masukanmu!',
      null,
      StatusCodes.CREATED
    );
  }

  async getMaterialSentiments(materialId: string) {
    // Hitung statistik sentimen untuk Guru
    const snapshot = await this.sentimentsRef
      .where('materialId', '==', materialId)
      .get();

    let helpfulCount = 0;
    let total = 0;
    const comments: string[] = [];

    snapshot.forEach((doc) => {
      const d = doc.data();
      total++;
      if (d.isHelpful) helpfulCount++;
      if (d.feedback) comments.push(d.feedback);
    });

    const percentage = total > 0 ? Math.round((helpfulCount / total) * 100) : 0;

    return ServiceResponse.success('Analisa Sentimen', {
      totalResponses: total,
      helpfulPercentage: percentage, // Misal: 80% siswa merasa terbantu
      comments, // Daftar komentar anonim
    });
  }

  // ======================================================
  // 2. STATISTIK KELAS (UNTUK GURU & WAKA)
  // ======================================================
  async getClassPerformance(courseId: string) {
    // Ambil semua submission di course ini yang sudah dinilai (GRADED)
    const snapshot = await this.submissionsRef
      .where('courseId', '==', courseId)
      .where('status', '==', 'GRADED')
      .get();

    if (snapshot.empty) {
      return ServiceResponse.success('Belum ada data nilai', {
        averageScore: 0,
        understandingRatio: 0,
        trend: 'Stagnan',
      });
    }

    let totalScore = 0;
    let studentCount = 0;
    let passedCount = 0; // Siswa yang paham (Nilai >= 70)

    // Grouping nilai per materi untuk melihat trend (Kenaikan/Penurunan)
    // Map<MaterialID, AverageScore>
    const materialScores: Record<string, { total: number; count: number }> = {};

    snapshot.forEach((doc) => {
      const d = doc.data();
      totalScore += d.score;
      studentCount++;

      if (d.score >= 70) passedCount++; // KKM asumsi 70

      // Masukkan ke grouping materi
      if (!materialScores[d.materialId]) {
        materialScores[d.materialId] = { total: 0, count: 0 };
      }
      materialScores[d.materialId].total += d.score;
      materialScores[d.materialId].count++;
    });

    const averageScore = Math.round(totalScore / studentCount);
    const understandingRatio = Math.round((passedCount / studentCount) * 100);

    // Hitung Trend (Bandingkan 2 materi terakhir)
    // Note: Ini penyederhanaan. Idealnya kita sort material by date dulu.
    const materialKeys = Object.keys(materialScores);
    let trend = 'Data belum cukup untuk tren';
    let trendPercentage = 0;

    if (materialKeys.length >= 2) {
      // Ambil 2 materi acak (karena object keys un-ordered, di production harus query materials sort by date)
      const mat1 = materialScores[materialKeys[materialKeys.length - 2]];
      const mat2 = materialScores[materialKeys[materialKeys.length - 1]];

      const avg1 = mat1.total / mat1.count;
      const avg2 = mat2.total / mat2.count;

      const diff = avg2 - avg1;
      trendPercentage = Math.round(diff);
      trend =
        diff > 0
          ? `Naik ${Math.round(diff)} poin`
          : `Turun ${Math.abs(Math.round(diff))} poin`;
    }

    return ServiceResponse.success('Performa Kelas', {
      averageScore,
      understandingRatio, // % Siswa Paham
      totalSubmissions: studentCount,
      trend, // String: "Naik 10 poin"
      trendPercentage, // Number: 10 atau -10
    });
  }

  // ======================================================
  // 3. RAPOR SISWA (UNTUK ORTU & SISWA)
  // ======================================================
  async getStudentReport(userId: string, courseId: string) {
    // Ambil nilai siswa ini
    const mySubmissions = await this.submissionsRef
      .where('userId', '==', userId)
      .where('courseId', '==', courseId)
      .where('status', '==', 'GRADED')
      .get();

    if (mySubmissions.empty)
      return ServiceResponse.success('Belum ada nilai', null);

    let totalScore = 0;
    let count = 0;
    const history: any[] = [];

    mySubmissions.forEach((doc) => {
      const d = doc.data();
      totalScore += d.score;
      count++;
      history.push({
        title: d.materialTitle,
        score: d.score,
        date: d.submittedAt,
      });
    });

    const average = Math.round(totalScore / count);

    // Feedback otomatis sederhana
    let feedback = 'Pertahankan prestasimu!';
    if (average < 70) feedback = 'Perlu peningkatan belajar, jangan menyerah!';
    if (average > 90)
      feedback = 'Luar biasa! Kamu sangat menguasai pelajaran ini.';

    return ServiceResponse.success('Laporan Belajar Siswa', {
      studentId: userId,
      averageScore: average,
      completedTasks: count,
      feedback, // Feedback otomatis
      history, // Riwayat nilai untuk grafik frontend
    });
  }
}

export default new AnalyticsService();
