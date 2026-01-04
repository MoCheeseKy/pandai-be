import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from '../config/swagger';

const router = express.Router();

// Endpoint untuk membuka UI Swagger
// Akses di: http://localhost:8080/docs
router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default router;
