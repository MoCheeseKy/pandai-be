import { Request, Response } from 'express';
import routes from '../../routes/v1';
import analyticsService from './service';
import asyncHandler from '../../modules/AsyncHandler';
import authorization from '../../common/middleware/Authorization';
import { sentimentSchema } from './schema';

// 1. Submit Sentimen (Siswa)
routes.post(
  '/analytics/sentiment',
  authorization,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userLogin.id;
    const formData = sentimentSchema.validateSync(req.body);

    const serviceResponse = await analyticsService.submitSentiment(
      userId,
      formData
    );
    res.status(serviceResponse.statusCode).json(serviceResponse);
  })
);

// 2. Dashboard Guru (Performa Kelas di Course tertentu)
// Menampilkan: Grafik pemahaman, Rata-rata nilai, Trend naik/turun
routes.get(
  '/analytics/teacher/course/:courseId',
  authorization,
  asyncHandler(async (req: Request, res: Response) => {
    // TODO: Validasi role Guru
    const { courseId } = req.params;
    const serviceResponse = await analyticsService.getClassPerformance(
      courseId
    );
    res.status(serviceResponse.statusCode).json(serviceResponse);
  })
);

// 3. Dashboard Guru (Lihat Sentimen Materi tertentu)
// Menampilkan: "80% Siswa terbantu", dan list komentar
routes.get(
  '/analytics/teacher/sentiment/:materialId',
  authorization,
  asyncHandler(async (req: Request, res: Response) => {
    const { materialId } = req.params;
    const serviceResponse = await analyticsService.getMaterialSentiments(
      materialId
    );
    res.status(serviceResponse.statusCode).json(serviceResponse);
  })
);

// 4. Dashboard Siswa/Ortu (Cek Rapor/Statistik anak)
routes.get(
  '/analytics/student/report/:courseId',
  authorization,
  asyncHandler(async (req: Request, res: Response) => {
    // Jika role Guru/Waka/Ortu, mereka mungkin kirim ?studentId=...
    // Jika role Murid, pakai ID login mereka sendiri.
    let targetUserId = req.userLogin.id;

    // Logika agar Ortu bisa cek nilai anak (jika ID anak dikirim via query)
    if (req.userLogin.role === 'orang_tua' && req.query.studentId) {
      targetUserId = req.query.studentId as string;
    }

    const { courseId } = req.params;
    const serviceResponse = await analyticsService.getStudentReport(
      targetUserId,
      courseId
    );
    res.status(serviceResponse.statusCode).json(serviceResponse);
  })
);
