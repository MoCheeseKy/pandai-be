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
    // ID unik kombinasi userId_materialId agar 1 siswa hanya isi 1x per materi
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
      helpfulPercentage: percentage,
      comments, // Feedback teks dari siswa
    });
  }

  // ======================================================
  // 2. STATISTIK KELAS (DASHBOARD GURU)
  // ======================================================
  async getClassPerformance(courseId: string) {
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
    let passedCount = 0;

    // Grouping nilai per materi untuk tren
    const materialScores: Record<string, { total: number; count: number }> = {};

    snapshot.forEach((doc) => {
      const d = doc.data();
      totalScore += d.score;
      studentCount++;

      if (d.score >= 70) passedCount++; // Anggap KKM 70

      if (!materialScores[d.materialId]) {
        materialScores[d.materialId] = { total: 0, count: 0 };
      }
      materialScores[d.materialId].total += d.score;
      materialScores[d.materialId].count++;
    });

    const averageScore = Math.round(totalScore / studentCount);
    const understandingRatio = Math.round((passedCount / studentCount) * 100);

    // Hitung Trend (Sederhana: Bandingkan 2 data terakhir di map)
    const materialKeys = Object.keys(materialScores);
    let trend = 'Data belum cukup';
    let trendPercentage = 0;

    if (materialKeys.length >= 2) {
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
      understandingRatio,
      totalSubmissions: studentCount,
      trend,
      trendPercentage,
    });
  }

  // ======================================================
  // 3. RAPOR SISWA (DETAIL NILAI)
  // ======================================================
  async getStudentReport(userId: string, courseId: string) {
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

    let feedback = 'Pertahankan!';
    if (average < 70) feedback = 'Perlu peningkatan, ayo belajar lagi!';
    if (average > 90) feedback = 'Luar biasa! Pertahankan prestasimu.';

    return ServiceResponse.success('Laporan Belajar Siswa', {
      studentId: userId,
      averageScore: average,
      completedTasks: count,
      feedback,
      history,
    });
  }

  // ======================================================
  // 4. REKOMENDASI BELAJAR (DASHBOARD HOME MURID)
  // ======================================================
  async getStudyRecommendations(userId: string) {
    const snapshot = await this.submissionsRef
      .where('userId', '==', userId)
      .where('status', '==', 'GRADED')
      .get();

    if (snapshot.empty) {
      return ServiceResponse.success('Belum ada data rekomendasi', []);
    }

    const courseScores: Record<string, { total: number; count: number }> = {};

    snapshot.forEach((doc) => {
      const d = doc.data();
      if (d.courseId) {
        if (!courseScores[d.courseId]) {
          courseScores[d.courseId] = { total: 0, count: 0 };
        }
        courseScores[d.courseId].total += d.score;
        courseScores[d.courseId].count++;
      }
    });

    const recommendations: any[] = [];

    for (const [courseId, stats] of Object.entries(courseScores)) {
      const avg = Math.round(stats.total / stats.count);
      // Jika rata-rata di bawah 75, masuk rekomendasi
      if (avg < 75) {
        recommendations.push({
          courseId,
          reason: 'Nilai rata-rata masih rendah',
          currentAverage: avg,
          priority: 'HIGH',
        });
      }
    }

    // Urutkan dari nilai terendah
    recommendations.sort((a, b) => a.currentAverage - b.currentAverage);

    return ServiceResponse.success('Rekomendasi Belajar', recommendations);
  }

  // ======================================================
  // 5. PROGRESS HARIAN (DASHBOARD HOME MURID)
  // ======================================================
  async getDailyProgress(userId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const snapshot = await this.submissionsRef
      .where('userId', '==', userId)
      .where('submittedAt', '>=', startOfDay)
      .where('submittedAt', '<=', endOfDay)
      .get();

    let completedCount = 0;
    let quizScoreTotal = 0;
    let quizCount = 0;

    snapshot.forEach((doc) => {
      const d = doc.data();
      completedCount++;
      if (d.type === 'QUIZ' && d.status === 'GRADED') {
        quizScoreTotal += d.score;
        quizCount++;
      }
    });

    const avgQuiz = quizCount > 0 ? Math.round(quizScoreTotal / quizCount) : 0;

    return ServiceResponse.success('Progress Hari Ini', {
      date: new Date(),
      totalActivities: completedCount,
      averageQuizScore: avgQuiz,
      message:
        completedCount > 0
          ? `Hebat! ${completedCount} aktivitas selesai hari ini.`
          : 'Belum ada aktivitas hari ini. Yuk mulai belajar!',
    });
  }
}

export default new AnalyticsService();
