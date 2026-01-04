import * as yup from 'yup';

// Schema Siswa Mengirim Jawaban (Quiz/Tugas Text)
export const submissionSchema = yup.object().shape({
  materialId: yup.string().required('ID Materi wajib diisi'),

  // Tipe submit: 'QUIZ', 'ASSIGNMENT', 'VIDEO_LOG'
  type: yup.string().required().oneOf(['QUIZ', 'ASSIGNMENT', 'VIDEO_LOG']),

  // Jawaban siswa.
  // Jika Quiz: Array of objects [{ questionId: 1, answer: 'A' }]
  // Jika Assignment: String deskripsi atau link
  // Jika Video: { progress: 80, lastCheckpoint: 120 }
  content: yup.mixed().required('Konten jawaban wajib diisi'),
});

// Schema Guru Memberi Nilai Manual (Grading)
export const gradingSchema = yup.object().shape({
  score: yup.number().min(0).max(100).required('Nilai (0-100) wajib diisi'),
  feedback: yup.string().nullable(), // Komentar guru: "Bagus, tapi kurang rapi"
});
