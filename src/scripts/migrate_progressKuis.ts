import db from "../config/firebase.config";

/* =========================
   HELPER HITUNG PROGRESS
   ========================= */
const hitungProgress = (prev: number, curr: number): number | null => {
  if (!prev || prev === 0) return null;
  return Math.round(((curr - prev) / prev) * 100 * 100) / 100;
};

const migrateProgressQuiz = async () => {
  console.log("🚀 Mulai migrasi progress quiz...");

  const snapshot = await db
    .collection("users")
    .where("role", "==", "siswa")
    .get();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const dataNilai = Array.isArray(data.dataNilai) ? data.dataNilai : [];

    if (dataNilai.length < 2) continue;

    // 🔑 URUTKAN BERDASARKAN BAB
    const sorted = [...dataNilai].sort((a, b) => a.bab - b.bab);

    const updatedDataNilai = sorted.map((item, index, arr) => {
      const prevQuiz = arr[index - 1]?.nilaiQuiz ?? 0;

      return {
        ...item,
        progressQuiz:
          index === 0
            ? null
            : hitungProgress(prevQuiz, item.nilaiQuiz ?? 0),
      };
    });

    await doc.ref.update({
      dataNilai: updatedDataNilai,
      updatedAt: new Date(),
    });

    console.log(`✅ Updated progress for siswa: ${data.fullname}`);
  }

  console.log("🎉 Migrasi selesai");
  process.exit(0);
};

migrateProgressQuiz().catch((err) => {
  console.error("❌ Migrasi gagal:", err);
  process.exit(1);
});
