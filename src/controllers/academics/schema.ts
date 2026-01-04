import * as yup from 'yup';

// --- SUBJECTS (Mata Pelajaran) ---
export const subjectSchema = yup.object().shape({
  name: yup.string().required('Nama mata pelajaran wajib (misal: Matematika)'),
  code: yup.string().required('Kode mapel wajib (misal: MTK-10)'),
  description: yup.string(),
});

// --- CLASSES (Kelas) ---
export const classSchema = yup.object().shape({
  name: yup.string().required('Nama kelas wajib (misal: X IPA 1)'),
  gradeLevel: yup.number().required('Tingkat kelas wajib (10/11/12)'),
  academicYear: yup.string().required('Tahun ajaran wajib (misal: 2024/2025)'),
  homeroomTeacherId: yup.string().nullable(), // ID Guru Wali Kelas (opsional)
});

// --- COURSES (Jadwal Pelajaran) ---
export const courseSchema = yup.object().shape({
  subjectId: yup.string().required('ID Mapel wajib diisi'), // Relasi ke collection subjects
  classId: yup.string().required('ID Kelas wajib diisi'), // Relasi ke collection classes
  teacherId: yup.string().required('ID Guru wajib diisi'), // Relasi ke collection users
  semester: yup.number().required('Semester wajib (1/2)'),
  academicYear: yup.string().required('Tahun ajaran wajib'), // 2024/2025
  day: yup
    .string()
    .required('Hari wajib diisi')
    .oneOf(
      ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
      'Hari tidak valid'
    ),
  timeStart: yup.string().required('Jam mulai wajib (Format HH:mm)'),
  timeEnd: yup.string().required('Jam selesai wajib (Format HH:mm)'),
});
