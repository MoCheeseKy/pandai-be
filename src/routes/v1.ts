import express, { Router } from "express";

/* ===== AUTH ===== */
import { signIn, signUp } from "../controllers/auth/controller";

/* ===== SISWA ===== */
import {
  getDaftarSiswa,
  getDetailSiswa,
  regisNilaiQuiz,
  regisNilaiMinigame,
  getNilaiSiswa,
  mustEvaluate,
} from "../controllers/siswa/controller";

const routes: Router = express.Router();

/* ===== AUTH ===== */
routes.post("/auth/signin", signIn);
routes.post("/auth/signup", signUp);

/* ===== SISWA ===== */
routes.get("/get-daftar/siswa", getDaftarSiswa);
routes.get("/get-detail/siswa", getDetailSiswa);
routes.post("/regis-nilai/quiz/siswa", regisNilaiQuiz);
routes.post("/regis-nilai/minigame/siswa", regisNilaiMinigame);
routes.get("/get-nilai/siswa", getNilaiSiswa);
routes.get("/get-nilai/siswa/must-evaluate", mustEvaluate);

export default routes;
