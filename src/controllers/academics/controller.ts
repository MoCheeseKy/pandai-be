import { Request, Response } from 'express';
import routes from '../../routes/v1';
import academicService from './service';
import asyncHandler from '../../modules/AsyncHandler';
import authorization from '../../common/middleware/Authorization';
import db from '../../config/firebase.config'; // Diperlukan untuk cek profile murid
import { subjectSchema, classSchema, courseSchema } from './schema';

// ==========================================
// ROUTES: SUBJECTS
// ==========================================
routes.post(
  '/academics/subjects',
  authorization,
  asyncHandler(async (req: Request, res: Response) => {
    // TODO: Idealnya cek role 'waka' atau 'admin' di sini
    const formData = subjectSchema.validateSync(req.body);
    const serviceResponse = await academicService.createSubject(formData);
    res.status(serviceResponse.statusCode).json(serviceResponse);
  })
);

routes.get(
  '/academics/subjects',
  authorization,
  asyncHandler(async (req: Request, res: Response) => {
    const serviceResponse = await academicService.getAllSubjects();
    res.status(serviceResponse.statusCode).json(serviceResponse);
  })
);

// ==========================================
// ROUTES: CLASSES
// ==========================================
routes.post(
  '/academics/classes',
  authorization,
  asyncHandler(async (req: Request, res: Response) => {
    const formData = classSchema.validateSync(req.body);
    const serviceResponse = await academicService.createClass(formData);
    res.status(serviceResponse.statusCode).json(serviceResponse);
  })
);

routes.get(
  '/academics/classes',
  asyncHandler(async (req: Request, res: Response) => {
    // Public/Auth access untuk dropdown registrasi
    const serviceResponse = await academicService.getAllClasses();
    res.status(serviceResponse.statusCode).json(serviceResponse);
  })
);

// ==========================================
// ROUTES: COURSES (JADWAL)
// ==========================================

// 1. Create Course (Admin/Waka)
routes.post(
  '/academics/courses',
  authorization,
  asyncHandler(async (req: Request, res: Response) => {
    const formData = courseSchema.validateSync(req.body);
    const serviceResponse = await academicService.createCourse(formData);
    res.status(serviceResponse.statusCode).json(serviceResponse);
  })
);

// 2. Get My Courses (Smart Endpoint)
routes.get(
  '/academics/courses/me',
  authorization,
  asyncHandler(async (req: Request, res: Response) => {
    const userRole = req.userLogin.role;
    const userId = req.userLogin.id;

    let serviceResponse;

    if (userRole === 'guru') {
      // Logic untuk GURU: Cari course berdasarkan teacherId
      serviceResponse = await academicService.getCoursesByTeacher(userId);
    } else if (userRole === 'murid') {
      // Logic untuk MURID: Cari course berdasarkan classId murid tersebut

      // 1. Ambil data profile murid untuk tahu dia kelas apa
      const profileDoc = await db.collection('profiles').doc(userId).get();
      const classId = profileDoc.data()?.classId;

      if (!classId) {
        res.status(400).json({
          statusCode: 400,
          message:
            'Anda belum terdaftar di kelas manapun. Silahkan update profile.',
        });
        return;
      }

      // 2. Ambil jadwal berdasarkan kelas
      serviceResponse = await academicService.getCoursesByClass(classId);
    } else {
      // Role lain (Waka/Ortu/Admin) mungkin melihat semua atau kosong
      serviceResponse = {
        statusCode: 200,
        message: 'Role ini tidak memiliki jadwal personal',
        data: [],
        success: true,
      };
    }

    res.status(serviceResponse.statusCode as number).json(serviceResponse);
  })
);
