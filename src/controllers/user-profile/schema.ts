import * as yup from 'yup';

// Schema untuk update data Murid
export const studentProfileSchema = yup.object().shape({
  nis: yup.string().required('NIS wajib diisi'),
  nisn: yup.string().required('NISN wajib diisi'),
  // classId nanti kita ambil dari modul academics, tapi wajib diisi string dulu
  classId: yup.string().required('ID Kelas wajib diisi'),
  address: yup.string().nullable(),
  phoneNumber: yup.string().nullable(),
  parentPhone: yup.string().required('No HP Orang Tua wajib untuk notifikasi'),
});

// Schema untuk update data Guru
export const teacherProfileSchema = yup.object().shape({
  nip: yup.string().required('NIP wajib diisi'),
  specialization: yup.string().required('Spesialisasi Mapel wajib diisi'),
  address: yup.string().nullable(),
  phoneNumber: yup.string().nullable(),
});

// Schema untuk update data Waka
export const wakaProfileSchema = yup.object().shape({
  nip: yup.string().required('NIP wajib diisi'),
  position: yup.string().default('Wakil Kepala Sekolah'),
});

// Schema untuk Orang Tua
export const parentProfileSchema = yup.object().shape({
  childrenNis: yup
    .array()
    .of(yup.string())
    .min(1, 'Masukkan minimal 1 NIS anak'),
  phoneNumber: yup.string().required(),
  address: yup.string(),
});
