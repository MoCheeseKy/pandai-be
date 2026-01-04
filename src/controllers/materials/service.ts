import db from '../../config/firebase.config';
import { ServiceResponse } from '../../common/models/serviceResponse';
import { StatusCodes } from 'http-status-codes';

class MaterialService {
  private chaptersRef = db.collection('chapters');
  private materialsRef = db.collection('materials');
  private coursesRef = db.collection('courses');

  // ==========================================
  // CHAPTERS (BAB)
  // ==========================================

  async createChapter(data: any) {
    // Validasi: Pastikan Course ada
    const courseDoc = await this.coursesRef.doc(data.courseId).get();
    if (!courseDoc.exists) {
      return ServiceResponse.failure(
        'Course ID tidak valid',
        null,
        StatusCodes.NOT_FOUND
      );
    }

    // Hitung jumlah bab saat ini untuk menentukan urutan (index)
    const existingChapters = await this.chaptersRef
      .where('courseId', '==', data.courseId)
      .count()
      .get();
    const orderIndex = existingChapters.data().count + 1;

    const newChapter = {
      ...data,
      orderIndex,
      createdAt: new Date(),
    };

    const docRef = await this.chaptersRef.add(newChapter);
    return ServiceResponse.success(
      'Bab berhasil dibuat',
      { id: docRef.id, ...newChapter },
      StatusCodes.CREATED
    );
  }

  async getChaptersByCourse(courseId: string) {
    // Ambil Bab dan urutkan berdasarkan orderIndex
    const snapshot = await this.chaptersRef
      .where('courseId', '==', courseId)
      .orderBy('orderIndex', 'asc')
      .get();

    const chapters = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return ServiceResponse.success('Daftar Bab', chapters);
  }

  // ==========================================
  // MATERIALS (MATERI)
  // ==========================================

  async createMaterial(data: any, fileUrl?: string) {
    // Validasi Bab
    const chapterDoc = await this.chaptersRef.doc(data.chapterId).get();
    if (!chapterDoc.exists) {
      return ServiceResponse.failure(
        'Bab (Chapter) tidak ditemukan',
        null,
        StatusCodes.NOT_FOUND
      );
    }

    // Parse contentBody jika dikirim sebagai string JSON dari frontend
    let parsedContent = {};
    try {
      if (typeof data.contentBody === 'string') {
        parsedContent = JSON.parse(data.contentBody);
      } else {
        parsedContent = data.contentBody || {};
      }
    } catch (e) {
      // Ignore parse error, use as is
    }

    const newMaterial = {
      chapterId: data.chapterId,
      title: data.title,
      type: data.type,
      description: data.description || '',
      content: parsedContent, // Config soal/kuis/video
      attachmentUrl: fileUrl || null, // URL File (PPT/Video) dari Vercel Blob
      deadline: data.deadline || null,
      createdAt: new Date(),
    };

    const docRef = await this.materialsRef.add(newMaterial);
    return ServiceResponse.success(
      'Materi berhasil ditambahkan',
      { id: docRef.id, ...newMaterial },
      StatusCodes.CREATED
    );
  }

  async getMaterialsByChapter(chapterId: string) {
    const snapshot = await this.materialsRef
      .where('chapterId', '==', chapterId)
      .orderBy('createdAt', 'asc') // Urutkan materi berdasarkan waktu buat
      .get();

    const materials = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return ServiceResponse.success('Daftar Materi', materials);
  }

  // Get Detail Materi (untuk halaman detail saat belajar)
  async getMaterialDetail(materialId: string) {
    const doc = await this.materialsRef.doc(materialId).get();
    if (!doc.exists) {
      return ServiceResponse.failure(
        'Materi tidak ditemukan',
        null,
        StatusCodes.NOT_FOUND
      );
    }
    return ServiceResponse.success('Detail Materi', {
      id: doc.id,
      ...doc.data(),
    });
  }
}

export default new MaterialService();
