import * as yup from 'yup';

// Schema untuk Sentimen (Feedback Siswa)
export const sentimentSchema = yup.object().shape({
  materialId: yup.string().required('ID Materi wajib diisi'),
  courseId: yup.string().required('ID Course wajib diisi'), // Untuk memudahkan agregasi per mapel

  // Pertanyaan: "Apakah penjelasan guru membantu?"
  isHelpful: yup.boolean().required('Status helpful wajib diisi (true/false)'),

  // Rating 1-5 (Opsional, untuk kedalaman data)
  rating: yup.number().min(1).max(5).default(0),

  // Komentar teks
  feedback: yup.string().max(500, 'Komentar maksimal 500 karakter'),
});

export type CreateSentimentType = yup.InferType<typeof sentimentSchema>;
