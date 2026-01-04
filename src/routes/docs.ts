import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from '../config/swagger';

const router = express.Router();

// PERBAIKAN UTAMA: Gunakan CSS dari CDN agar tidak blank di Vercel
const CSS_URL =
  'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css';

router.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customCssUrl: CSS_URL, // Load CSS dari internet
    customSiteTitle: 'Pandai LMS Docs',
    swaggerOptions: {
      persistAuthorization: true, // Token tidak hilang saat refresh page
    },
  })
);

export default router;
