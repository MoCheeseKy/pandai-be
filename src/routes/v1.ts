<<<<<<< HEAD
import express, { Router } from "express";
import {signIn, signUp} from '../controllers/auth/controller';

import {
  getDaftarSiswa,
  getDetailSiswa,
  regisNilaiQuiz,
  regisNilaiMinigame,
  getNilaiSiswa,
  mustEvaluate,
} from "../controllers/siswa/controller";
=======
import express, { Router } from 'express';
>>>>>>> 76d9595deb114a25c0406f24380513218ebb9455

const routes: Router = express.Router();
/* ===== AUTH ===== */
routes.post('/auth/signin', signIn);
routes.post('/auth/signup', signUp);

// ===== SISWA =====
routes.get("/get-daftar/siswa", getDaftarSiswa);
routes.get("/get-detail/siswa", getDetailSiswa);
routes.post("/regis-nilai/quiz/siswa", regisNilaiQuiz);
routes.post("/regis-nilai/minigame/siswa", regisNilaiMinigame);
routes.get("/get-nilai/siswa", getNilaiSiswa);
routes.get("/get-nilai/siswa/must-evaluate", mustEvaluate);

export default routes;
<<<<<<< HEAD
=======
require('../controllers/auth/controller');
require('../controllers/posts/controller');
require('../controllers/user-profile/controller');
require('../controllers/academics/controller');
require('../controllers/materials/controller');
require('../controllers/submissions/controller');
require('../controllers/analytics/controller');
>>>>>>> 76d9595deb114a25c0406f24380513218ebb9455
