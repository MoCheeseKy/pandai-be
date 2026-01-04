import express, { Router } from 'express';

const routes: Router = express.Router();

export default routes;
require('../controllers/auth/controller');
require('../controllers/posts/controller');
require('../controllers/user-profile/controller');
require('../controllers/academics/controller');
require('../controllers/materials/controller');
require('../controllers/submissions/controller');
require('../controllers/analytics/controller');
