import { Request, Response } from 'express';
import routes from '../../routes/v1';
import analyticsService from './service';
import asyncHandler from '../../modules/AsyncHandler';
import authorization from '../../common/middleware/Authorization';
import { sentimentSchema } from './schema';

// 1. Submit Sentimen
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

// 2. Dashboard Guru: Performa Kelas
routes.get(
  '/analytics/teacher/course/:courseId',
  authorization,
  asyncHandler(async (req: Request, res: Response) => {
    const { courseId } = req.params;
    // TODO: Validasi role userLogin.role === 'guru'
    const serviceResponse = await analyticsService.getClassPerformance(
      courseId
    );
    res.status(serviceResponse.statusCode).json(serviceResponse);
  })
);

// 3. Dashboard Guru: Sentimen Materi
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

// 4. Rapor Siswa (Bisa diakses Ortu & Siswa)
routes.get(
  '/analytics/student/report/:courseId',
  authorization,
  asyncHandler(async (req: Request, res: Response) => {
    let targetUserId = req.userLogin.id;
    // Jika Ortu ingin lihat nilai anak
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

// 5. Dashboard Murid: Rekomendasi Belajar
routes.get(
  '/analytics/student/recommendations',
  authorization,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userLogin.id;
    const serviceResponse = await analyticsService.getStudyRecommendations(
      userId
    );
    res.status(serviceResponse.statusCode).json(serviceResponse);
  })
);

// 6. Dashboard Murid: Progress Harian
routes.get(
  '/analytics/student/daily-progress',
  authorization,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userLogin.id;
    const serviceResponse = await analyticsService.getDailyProgress(userId);
    res.status(serviceResponse.statusCode).json(serviceResponse);
  })
);
