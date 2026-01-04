import { Request, Response } from 'express';
import routes from '../../routes/v1';
import submissionService from './service';
import asyncHandler from '../../modules/AsyncHandler';
import authorization from '../../common/middleware/Authorization';
import Multer, {
  allowedMimetypePDF,
  allowedMimetypeDoc,
  allowedMimetypeImage,
} from '../../modules/Multer';
import { submissionSchema, gradingSchema } from './schema';

// Config Multer untuk Tugas Siswa (PDF, Word, Gambar)
const uploadAssignment = Multer.useMulter(
  Multer.getDefaultUploadFileOptions({
    dest: 'public/uploads/assignments',
    allowedMimetype: [
      ...allowedMimetypePDF,
      ...allowedMimetypeDoc,
      ...allowedMimetypeImage,
    ],
    allowedExt: ['.pdf', '.doc', '.docx', '.jpg', '.png'],
  })
).single('file'); // Field name: 'file'

// ==========================================
// ENDPOINT SISWA
// ==========================================

// 1. Submit Tugas / Kuis
routes.post(
  '/submissions',
  authorization,
  uploadAssignment, // Handle file jika tipe ASSIGNMENT
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userLogin.id;

    // Validasi Body
    const formData = submissionSchema.validateSync(req.body);

    // Handle File Upload ke Vercel Blob (Jika ada)
    let fileUrl = undefined;
    if (req.file) {
      const filesObject = { file: [req.file] };
      const savedFilePaths = await Multer.vercelBlobHandler(filesObject);
      fileUrl = savedFilePaths.find((e) => e.fieldName === 'file')?.paths[0];
    }

    const serviceResponse = await submissionService.submitWork(
      userId,
      formData,
      fileUrl
    );
    res.status(serviceResponse.statusCode).json(serviceResponse);
  })
);

// 2. Lihat Nilai Saya (Per Course)
routes.get(
  '/submissions/me/:courseId',
  authorization,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userLogin.id;
    const { courseId } = req.params;

    const serviceResponse = await submissionService.getMyGrades(
      userId,
      courseId
    );
    res.status(serviceResponse.statusCode).json(serviceResponse);
  })
);

// ==========================================
// ENDPOINT GURU
// ==========================================

// 3. Input Nilai Manual (Grading)
routes.put(
  '/submissions/grade/:submissionId',
  authorization,
  asyncHandler(async (req: Request, res: Response) => {
    // TODO: Cek role Guru
    const { submissionId } = req.params;
    const { score, feedback } = gradingSchema.validateSync(req.body);

    const serviceResponse = await submissionService.gradeSubmission(
      submissionId,
      score,
      feedback || ''
    );
    res.status(serviceResponse.statusCode).json(serviceResponse);
  })
);

// 4. Lihat Rekap Nilai Satu Kelas (Untuk Tabel Nilai)
routes.get(
  '/submissions/class/:classId/material/:materialId',
  authorization,
  asyncHandler(async (req: Request, res: Response) => {
    // TODO: Cek role Guru
    const { classId, materialId } = req.params;

    const serviceResponse = await submissionService.getClassGrades(
      classId,
      materialId
    );
    res.status(serviceResponse.statusCode).json(serviceResponse);
  })
);
