import { env } from '../common/utils/envConfig';

export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Pandai LMS API',
    version: '1.0.0',
    description: 'Dokumentasi API untuk Learning Management System Pandai',
    contact: {
      name: 'Tim Pengembang',
    },
  },
  // PERBAIKAN UTAMA: Gunakan url "/" (relative) agar otomatis ikut HTTPS Vercel
  servers: [
    {
      url: '/',
      description: 'Current Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  paths: {
    // ==========================
    // AUTHENTICATION
    // ==========================
    '/auth/signin': {
      post: {
        tags: ['Auth'],
        summary: 'Login Pengguna',
        security: [], // Public endpoint
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'siswa@sekolah.id' },
                  password: { type: 'string', example: 'rahasia123' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login berhasil, mengembalikan Token' },
        },
      },
    },

    // ==========================
    // USER PROFILE
    // ==========================
    '/profile/me': {
      get: {
        tags: ['Profile'],
        summary: 'Get Profile Saya',
        responses: {
          200: { description: 'Data profile ditemukan' },
        },
      },
    },
    '/profile/student': {
      put: {
        tags: ['Profile'],
        summary: 'Update Profile Murid',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nis: { type: 'string' },
                  nisn: { type: 'string' },
                  classId: { type: 'string' },
                  parentPhone: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Profile berhasil diupdate' },
        },
      },
    },

    // ==========================
    // ACADEMICS
    // ==========================
    '/academics/courses/me': {
      get: {
        tags: ['Academics'],
        summary: 'Lihat Jadwal Pelajaran Saya',
        description:
          'Otomatis mendeteksi role. Murid melihat mapel kelasnya, Guru melihat jadwal mengajarnya.',
        responses: {
          200: { description: 'List Jadwal Pelajaran' },
        },
      },
    },
    '/academics/classes': {
      get: {
        tags: ['Academics'],
        summary: 'List Semua Kelas',
        description: 'Digunakan untuk dropdown saat registrasi/update profile',
        responses: {
          200: { description: 'List Kelas' },
        },
      },
    },

    // ==========================
    // MATERIALS
    // ==========================
    '/materials/chapters/{courseId}': {
      get: {
        tags: ['Materials'],
        summary: 'List Bab dalam Mapel',
        parameters: [
          {
            name: 'courseId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'List Bab' },
        },
      },
    },
    '/materials/by-chapter/{chapterId}': {
      get: {
        tags: ['Materials'],
        summary: 'List Materi dalam Bab',
        parameters: [
          {
            name: 'chapterId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'List Materi (Video, PPT, Quiz)' },
        },
      },
    },

    // ==========================
    // ANALYTICS & DASHBOARD
    // ==========================
    '/analytics/student/daily-progress': {
      get: {
        tags: ['Analytics - Student'],
        summary: 'Progress Harian Murid',
        responses: {
          200: { description: 'Statistik aktivitas hari ini' },
        },
      },
    },
    '/analytics/student/recommendations': {
      get: {
        tags: ['Analytics - Student'],
        summary: 'Rekomendasi Belajar',
        description: 'Mapel dengan nilai terendah yang perlu ditingkatkan',
        responses: {
          200: { description: 'List rekomendasi' },
        },
      },
    },
    '/analytics/teacher/course/{courseId}': {
      get: {
        tags: ['Analytics - Teacher'],
        summary: 'Statistik Performa Kelas',
        parameters: [
          {
            name: 'courseId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Rata-rata nilai, Rasio pemahaman, Tren' },
        },
      },
    },
  },
};
