import db from "../../config/firebase.config";
import { ServiceResponse } from "../../common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";

class SiswaService {
  private usersRef = db.collection("users");

  /* =========================
     HELPER: HITUNG PROGRESS (%)
     ========================= */
  private hitungProgress(prev: number, curr: number): number | null {
    if (!prev || prev === 0) return null;
    return Math.round(((curr - prev) / prev) * 100 * 100) / 100;
  }

  /* =========================
     GET SEMUA SISWA
     ========================= */
  async getAll() {
    const snapshot = await this.usersRef.where("role", "==", "siswa").get();

    const data = snapshot.docs.map((d) => {
      const u = d.data();
      return {
        nama: u.fullname,
        nis: u.nis,
        nisn: u.nisn,
      };
    });

    return ServiceResponse.success("success", data, StatusCodes.OK);
  }

  /* =========================
     GET DETAIL SISWA BY NIS
     ========================= */
  async getDetailByNis(nis: string) {
    if (!nis) {
      return ServiceResponse.failure(
        "NIS is required",
        null,
        StatusCodes.BAD_REQUEST
      );
    }

    const snap = await this.usersRef
      .where("role", "==", "siswa")
      .where("nis", "==", nis)
      .limit(1)
      .get();

    if (snap.empty) {
      return ServiceResponse.failure(
        "Siswa not found",
        null,
        StatusCodes.NOT_FOUND
      );
    }

    const data = snap.docs[0].data();

    return ServiceResponse.success(
      "success",
      {
        nama: data.fullname,
        nis: data.nis,
        nisn: data.nisn,
        dataNilai: data.dataNilai ?? [],
        totalNilaiSemuaSemester: data.totalNilaiSemuaSemester ?? 0,
      },
      StatusCodes.OK
    );
  }

  /* =========================
     INPUT NILAI QUIZ / MINIGAME
     + PROGRESS (%)
     ========================= */
  async storeNilai(
    nis: string,
    bab: number,
    nilai: number,
    type: "quiz" | "minigame"
  ) {
    if (!nis || bab === undefined || nilai === undefined || !type) {
      return ServiceResponse.failure(
        "Invalid input data",
        { nis, bab, nilai, type },
        StatusCodes.BAD_REQUEST
      );
    }

    const snap = await this.usersRef
      .where("role", "==", "siswa")
      .where("nis", "==", nis)
      .limit(1)
      .get();

    if (snap.empty) {
      return ServiceResponse.failure(
        "Siswa not found",
        null,
        StatusCodes.NOT_FOUND
      );
    }

    const doc = snap.docs[0];
    const data = doc.data();

    const dataNilaiAwal = Array.isArray(data.dataNilai) ? data.dataNilai : [];

    const dataNilai = dataNilaiAwal.map(
      (item: any, index: number, arr: any[]) => {
        if (item.bab === bab) {
          const quizAwal = item.nilaiQuiz ?? 0;
          const minigameAwal = item.nilaiMinigame ?? 0;

          const nilaiQuiz = type === "quiz" ? nilai : quizAwal;
          const nilaiMinigame = type === "minigame" ? nilai : minigameAwal;

          // 🔑 NILAI QUIZ BAB SEBELUMNYA
          const prevQuiz = arr[index - 1]?.nilaiQuiz ?? 0;

          const progressQuiz =
            type === "quiz"
              ? this.hitungProgress(prevQuiz, nilaiQuiz)
              : item.progressQuiz ?? null;

          return {
            ...item,
            nilaiQuiz,
            nilaiMinigame,
            nilaiTotal: Math.round((nilaiQuiz + nilaiMinigame) / 2),
            progressQuiz, // 🔥 NAIK / TURUN (%)
          };
        }

        return item;
      }
    );

    const nilaiValid = dataNilai.filter(
      (i: any) => typeof i.nilaiTotal === "number"
    );

    const totalNilaiSemuaSemester =
      nilaiValid.length > 0
        ? Math.round(
            nilaiValid.reduce((sum: number, i: any) => sum + i.nilaiTotal, 0) /
              nilaiValid.length
          )
        : 0;

    await doc.ref.update({
      dataNilai,
      totalNilaiSemuaSemester,
      updatedAt: new Date(),
    });

    return ServiceResponse.success("success", null, StatusCodes.OK);
  }

  /* =========================
     GET NILAI (ALL / PER BAB)
     ========================= */
  async getNilai(bab?: number) {
    const snapshot = await this.usersRef.where("role", "==", "siswa").get();

    const data = snapshot.docs.map((d) => {
      const s = d.data();
      const dataNilai = Array.isArray(s.dataNilai) ? s.dataNilai : [];

      return {
        nama: s.fullname,
        nis: s.nis,
        nilai: bab
          ? dataNilai.find((b: any) => b.bab === bab) ?? null
          : dataNilai,
        totalNilaiSemuaSemester: s.totalNilaiSemuaSemester ?? 0,
      };
    });

    return ServiceResponse.success("success", data, StatusCodes.OK);
  }

  /* =========================
     MUST EVALUATE
     (TOP 3 QUIZ TERENDAH)
     ========================= */
  async mustEvaluate() {
    const snapshot = await this.usersRef.where("role", "==", "siswa").get();

    const allQuiz = snapshot.docs.flatMap((d) => {
      const u = d.data();
      const dataNilai = Array.isArray(u.dataNilai) ? u.dataNilai : [];

      return dataNilai.map((n: any) => ({
        nama: u.fullname,
        nilai: n.nilaiQuiz ?? 0,
        materiBab: n.materi ?? null,
      }));
    });

    const result = allQuiz.sort((a, b) => a.nilai - b.nilai).slice(0, 3);

    return ServiceResponse.success("success", result, StatusCodes.OK);
  }
}

export default new SiswaService();
