import { env } from "../common/utils/envConfig";

export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Pandai LMS API",
    version: "1.0.0",
    description:
      "Dokumentasi API lengkap untuk Learning Management System Pandai",
    contact: { name: "Tim Pengembang" },
  },
  servers: [{ url: "/", description: "Current Server" }],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    // ==========================
    // AUTHENTICATION
    // ==========================
    "/auth/signin": {
      post: {
        tags: ["Auth"],
        summary: "Login Pengguna",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", example: "user@sekolah.id" },
                  password: { type: "string", example: "password123" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Login berhasil" } },
      },
    },
    "/auth/signup": {
      post: {
        tags: ["Auth"],
        summary: "Registrasi Pengguna Baru",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string" },
                  password: { type: "string" },
                  fullName: { type: "string" },
                  role: {
                    type: "string",
                    enum: ["murid", "guru", "orang_tua", "waka"],
                  },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Registrasi berhasil" } },
      },
    },

    // ==========================
    // SISWA (LEGACY/INTERNAL)
    // ==========================
    "/get-daftar/siswa": {
      get: {
        tags: ["Siswa (Legacy)"],
        summary: "Ambil semua daftar siswa",
        responses: { 200: { description: "Daftar siswa ditemukan" } },
      },
    },
    "/get-detail/siswa": {
      get: {
        tags: ["Siswa (Legacy)"],
        summary: "Ambil detail siswa berdasarkan NIS",
        parameters: [
          {
            name: "nis",
            in: "query",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: { 200: { description: "Detail siswa ditemukan" } },
      },
    },
    "/regis-nilai/quiz/siswa": {
      post: {
        tags: ["Siswa (Legacy)"],
        summary: "Input nilai Quiz manual",
        parameters: [
          {
            name: "nis",
            in: "query",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "bab",
            in: "query",
            required: true,
            schema: { type: "integer" },
          },
          {
            name: "nilai",
            in: "query",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { 200: { description: "Nilai berhasil disimpan" } },
      },
    },
    "/regis-nilai/minigame/siswa": {
      post: {
        tags: ["Siswa (Legacy)"],
        summary: "Input nilai Minigame manual",
        parameters: [
          {
            name: "nis",
            in: "query",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "bab",
            in: "query",
            required: true,
            schema: { type: "integer" },
          },
          {
            name: "nilai",
            in: "query",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { 200: { description: "Nilai berhasil disimpan" } },
      },
    },
    "/get-nilai/siswa": {
      get: {
        tags: ["Siswa (Legacy)"],
        summary: "Ambil rekap nilai siswa",
        parameters: [
          {
            name: "bab",
            in: "query",
            required: false,
            schema: { type: "integer" },
          },
        ],
        responses: { 200: { description: "Data nilai ditemukan" } },
      },
    },
    "/get-nilai/siswa/must-evaluate": {
      get: {
        tags: ["Siswa (Legacy)"],
        summary: "Daftar siswa yang perlu evaluasi",
        responses: { 200: { description: "Data evaluasi ditemukan" } },
      },
    },

    // ==========================
    // POSTS (BERITA/ARTIKEL)
    // ==========================
    "/posts": {
      get: {
        tags: ["Posts"],
        summary: "Ambil semua postingan",
        responses: { 200: { description: "Daftar postingan" } },
      },
      post: {
        tags: ["Posts"],
        summary: "Buat postingan baru (Guru/Waka)",
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  content: { type: "string" },
                  banner: { type: "string", format: "binary" },
                  documentations: {
                    type: "array",
                    items: { type: "string", format: "binary" },
                  },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Post created" } },
      },
    },

    // ==========================
    // ACADEMICS
    // ==========================
    "/academics/subjects": {
      get: {
        tags: ["Academics"],
        summary: "List semua mata pelajaran",
        responses: { 200: { description: "OK" } },
      },
      post: {
        tags: ["Academics"],
        summary: "Tambah mata pelajaran baru",
        responses: { 201: { description: "Created" } },
      },
    },
    "/academics/classes": {
      get: {
        tags: ["Academics"],
        summary: "List semua kelas",
        responses: { 200: { description: "OK" } },
      },
    },
    "/academics/courses/me": {
      get: {
        tags: ["Academics"],
        summary: "Lihat jadwal saya (Berdasarkan Role)",
        responses: { 200: { description: "Jadwal ditemukan" } },
      },
    },

    // ==========================
    // MATERIALS & CHAPTERS
    // ==========================
    "/materials/chapters/{courseId}": {
      get: {
        tags: ["Materials"],
        summary: "List Bab dalam Mapel",
        parameters: [
          {
            name: "courseId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: { 200: { description: "OK" } },
      },
    },
    "/materials": {
      post: {
        tags: ["Materials"],
        summary: "Upload materi baru (Guru)",
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  chapterId: { type: "string" },
                  title: { type: "string" },
                  type: { type: "string", enum: ["VIDEO", "DOCUMENT", "QUIZ"] },
                  attachment: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Material uploaded" } },
      },
    },

    // ==========================
    // SUBMISSIONS & GRADING
    // ==========================
    "/submissions": {
      post: {
        tags: ["Submissions"],
        summary: "Siswa mengumpulkan tugas/kuis",
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  materialId: { type: "string" },
                  file: { type: "string", format: "binary" },
                  answerData: {
                    type: "string",
                    description: "JSON string untuk kuis",
                  },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Submitted" } },
      },
    },
    "/submissions/grade/{submissionId}": {
      put: {
        tags: ["Submissions"],
        summary: "Guru memberi nilai",
        parameters: [
          {
            name: "submissionId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  score: { type: "number" },
                  feedback: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Graded" } },
      },
    },

    // ==========================
    // ANALYTICS
    // ==========================
    "/analytics/student/report/{courseId}": {
      get: {
        tags: ["Analytics"],
        summary: "Ambil rapor nilai per mapel",
        parameters: [
          {
            name: "courseId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "studentId",
            in: "query",
            schema: { type: "string" },
            description: "Wajib jika role Orang Tua",
          },
        ],
        responses: { 200: { description: "Data rapor" } },
      },
    },
    "/analytics/sentiment": {
      post: {
        tags: ["Analytics"],
        summary: "Submit feedback emosional siswa terhadap materi",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  materialId: { type: "string" },
                  sentiment: {
                    type: "string",
                    enum: ["HAPPY", "NEUTRAL", "SAD"],
                  },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Sentiment recorded" } },
      },
    },
  },
};
