import * as yup from 'yup';

// --- CHAPTER (BAB) ---
export const chapterSchema = yup.object().shape({
  courseId: yup.string().required('ID Jadwal/Course wajib diisi'),
  title: yup
    .string()
    .required('Judul Bab wajib diisi (misal: Bab 1 - Aljabar)'),
});

// --- MATERIAL (MATERI) ---
// Kita gunakan field 'content' berbentuk JSON string untuk menyimpan data fleksibel
// (misal: config minigame, daftar soal quiz, atau checkpoint video)
export const materialSchema = yup.object().shape({
  chapterId: yup.string().required('ID Bab wajib diisi'),
  title: yup.string().required('Judul materi wajib diisi'),
  type: yup
    .string()
    .required('Tipe materi wajib')
    .oneOf(
      ['VIDEO_INTERACTIVE', 'PPT', 'QUIZ', 'SENTIMENT', 'MINIGAME'],
      'Tipe materi tidak valid'
    ),
  description: yup.string(),

  // Field fleksibel untuk config (disimpan sebagai JSON)
  // Contoh isi untuk Quiz: { "duration": 60, "maxAttempts": 3, "questions": [...] }
  // Contoh isi untuk Video: { "checkpoints": [{ "time": 120, "question": "..." }] }
  contentBody: yup.mixed(),

  // Settings tambahan (Deadline, dll)
  deadline: yup.date().nullable(),
});

export type CreateChapterType = yup.InferType<typeof chapterSchema>;
