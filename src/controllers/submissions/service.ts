import db from '../../config/firebase.config';
import { ServiceResponse } from '../../common/models/serviceResponse';
import { StatusCodes } from 'http-status-codes';

class SubmissionService {
  private submissionsRef = db.collection('submissions');
  private materialsRef = db.collection('materials');
  private usersRef = db.collection('users');
  private profilesRef = db.collection('profiles');
  private chaptersRef = db.collection('chapters');

  // ==========================================
  // 1. SUBMIT JAWABAN (SISWA)
  // ==========================================
  async submitWork(userId: string, data: any, fileUrl?: string) {
    // A. Ambil Data Materi & Validasi
    const materialDoc = await this.materialsRef.doc(data.materialId).get();
    if (!materialDoc.exists) {
      return ServiceResponse.failure(
        'Materi tidak ditemukan',
        null,
        StatusCodes.NOT_FOUND
      );
    }
    const materialData = materialDoc.data();

    // B. Cek Profile Siswa (Untuk mengambil ClassID & Nama agar data submission lengkap)
    const userDoc = await this.usersRef.doc(userId).get();
    const profileDoc = await this.profilesRef.doc(userId).get();

    // Ambil CourseID lewat Chapter (Material -> Chapter -> Course)
    // Ini penting untuk filter gradebook per mata pelajaran
    const chapterDoc = await this.chaptersRef
      .doc(materialData?.chapterId)
      .get();
    const courseId = chapterDoc.exists ? chapterDoc.data()?.courseId : null;

    // C. Logika Penilaian (Auto vs Manual)
    let score = 0;
    let status = 'PENDING_REVIEW'; // Default menunggu koreksi guru

    if (data.type === 'QUIZ' && materialData?.content?.questions) {
      // --- LOGIKA AUTO-GRADING QUIZ ---
      const studentAnswers =
        typeof data.content === 'string'
          ? JSON.parse(data.content)
          : data.content;
      const keyAnswers = materialData.content.questions; // Asumsi format: [{id: 1, correctAnswer: 'A'}]

      let correctCount = 0;
      let totalQuestions = keyAnswers.length;

      // Loop cek jawaban
      if (Array.isArray(studentAnswers)) {
        studentAnswers.forEach((ans: any) => {
          const key = keyAnswers.find((k: any) => k.id == ans.questionId);
          if (key && key.correctAnswer === ans.answer) {
            correctCount++;
          }
        });
      }

      // Hitung Nilai (0-100)
      score =
        totalQuestions > 0
          ? Math.round((correctCount / totalQuestions) * 100)
          : 0;
      status = 'GRADED'; // Langsung dinilai
    } else if (data.type === 'VIDEO_LOG') {
      // Logic Video Selesai
      status = 'COMPLETED';
      score = 100; // Atau hitung berdasarkan % progress
    }

    // D. Simpan ke Database
    // Gunakan ID unik kombinasi userId_materialId agar siswa tidak double submit (atau bisa dibuat revisi)
    const submissionId = `${userId}_${data.materialId}`;

    const submissionData = {
      userId,
      studentName: userDoc.data()?.fullname,
      classId: profileDoc.data()?.classId || 'Unassigned',
      courseId: courseId,

      materialId: data.materialId,
      materialTitle: materialData?.title,
      type: data.type,

      content: data.content, // Jawaban raw
      attachmentUrl: fileUrl || null, // File tugas jika ada

      score, // Nilai (0 jika butuh koreksi manual)
      status, // GRADED, PENDING_REVIEW, COMPLETED
      feedback: null,

      submittedAt: new Date(),
    };

    await this.submissionsRef.doc(submissionId).set(submissionData);

    return ServiceResponse.success(
      status === 'GRADED'
        ? `Kuis selesai! Nilai kamu: ${score}`
        : 'Tugas berhasil dikirim',
      submissionData
    );
  }

  // ==========================================
  // 2. BERI NILAI MANUAL (GURU)
  // ==========================================
  async gradeSubmission(submissionId: string, score: number, feedback: string) {
    const docRef = this.submissionsRef.doc(submissionId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return ServiceResponse.failure(
        'Data tugas tidak ditemukan',
        null,
        StatusCodes.NOT_FOUND
      );
    }

    await docRef.update({
      score,
      feedback,
      status: 'GRADED',
      gradedAt: new Date(),
    });

    return ServiceResponse.success('Nilai berhasil disimpan', {
      id: submissionId,
      score,
    });
  }

  // ==========================================
  // 3. LIHAT NILAI (GRADEBOOK)
  // ==========================================

  // Untuk Siswa: Lihat nilai saya di satu course
  async getMyGrades(userId: string, courseId: string) {
    // Filter berdasarkan User dan Course
    const snapshot = await this.submissionsRef
      .where('userId', '==', userId)
      .where('courseId', '==', courseId)
      .get();

    const grades = snapshot.docs.map((doc) => doc.data());
    return ServiceResponse.success('Data nilai siswa', grades);
  }

  // Untuk Guru: Lihat nilai satu KELAS untuk materi tertentu
  async getClassGrades(classId: string, materialId: string) {
    const snapshot = await this.submissionsRef
      .where('classId', '==', classId)
      .where('materialId', '==', materialId)
      .get();

    const grades = snapshot.docs.map((doc) => doc.data());
    return ServiceResponse.success('Data nilai kelas', grades);
  }
}

export default new SubmissionService();
