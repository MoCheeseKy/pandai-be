import { Request, Response } from 'express';
import routes from '../../routes/v1';
import materialService from './service';
import asyncHandler from '../../modules/AsyncHandler';
import authorization from '../../common/middleware/Authorization';
import Multer, {
  allowedMimetypePDF,
  allowedMimetypeVideo,
  allowedMimetypeDoc,
} from '../../modules/Multer';
import { chapterSchema, materialSchema } from './schema';

// Kita definisikan manual MimeType untuk PPT karena belum ada di module Multer.ts bawaan
const allowedMimetypePPT = [
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

// Config Multer
const uploadMaterialFile = Multer.useMulter(
  Multer.getDefaultUploadFileOptions({
    dest: 'public/uploads',
    // PERBAIKAN: Gunakan allowedMimetype, jangan custom fileFilter
    allowedMimetype: [
      ...allowedMimetypePDF,
      ...allowedMimetypeVideo,
      ...allowedMimetypeDoc, // Support Word
      ...allowedMimetypePPT, // Support PPT
    ],
    // Tambahkan allowedExt agar pesan error dari Multer.ts lebih akurat
    allowedExt: [
      '.pdf',
      '.mp4',
      '.mkv',
      '.webm',
      '.doc',
      '.docx',
      '.ppt',
      '.pptx',
    ],
  })
).single('attachment'); // Nama field di form-data: 'attachment'

// ==========================================
// ROUTES: CHAPTERS (BAB)
// ==========================================

routes.post(
  '/materials/chapters',
  authorization,
  asyncHandler(async (req: Request, res: Response) => {
    // TODO: Cek apakah user adalah GURU pemilik Course tersebut
    const formData = chapterSchema.validateSync(req.body);
    const serviceResponse = await materialService.createChapter(formData);
    res.status(serviceResponse.statusCode).json(serviceResponse);
  })
);

routes.get(
  '/materials/chapters/:courseId',
  authorization,
  asyncHandler(async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const serviceResponse = await materialService.getChaptersByCourse(courseId);
    res.status(serviceResponse.statusCode).json(serviceResponse);
  })
);

// ==========================================
// ROUTES: MATERIALS (KONTEN)
// ==========================================

routes.post(
  '/materials',
  authorization,
  uploadMaterialFile, // Middleware Upload
  asyncHandler(async (req: Request, res: Response) => {
    // 1. Validasi Body
    const formData = materialSchema.validateSync(req.body);

    // 2. Handle File Upload (jika ada)
    let fileUrl = undefined;
    if (req.file) {
      // Upload ke Vercel Blob (menggunakan helper yang ada di projectmu)
      // Kita bungkus req.file ke dalam format yang diharapkan oleh vercelBlobHandler
      const filesObject = { attachment: [req.file] };
      const savedFilePaths = await Multer.vercelBlobHandler(filesObject);

      // Ambil URL dari hasil upload
      fileUrl = savedFilePaths.find((e) => e.fieldName === 'attachment')
        ?.paths[0];
    }

    // 3. Simpan ke Database
    const serviceResponse = await materialService.createMaterial(
      formData,
      fileUrl
    );
    res.status(serviceResponse.statusCode).json(serviceResponse);
  })
);

routes.get(
  '/materials/by-chapter/:chapterId',
  authorization,
  asyncHandler(async (req: Request, res: Response) => {
    const { chapterId } = req.params;
    const serviceResponse = await materialService.getMaterialsByChapter(
      chapterId
    );
    res.status(serviceResponse.statusCode).json(serviceResponse);
  })
);

routes.get(
  '/materials/detail/:materialId',
  authorization,
  asyncHandler(async (req: Request, res: Response) => {
    const { materialId } = req.params;
    const serviceResponse = await materialService.getMaterialDetail(materialId);
    res.status(serviceResponse.statusCode).json(serviceResponse);
  })
);
