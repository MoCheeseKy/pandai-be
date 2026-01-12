import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from '../config/swagger';

const router = express.Router();

// Gunakan versi CDN yang stabil (v5.0.0 sesuai dengan swagger-ui-express kamu)
const CDN_CSS =
  'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui.min.css';
const CDN_BUNDLE =
  'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui-bundle.min.js';
const CDN_PRESET =
  'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui-standalone-preset.min.js';

router.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customCssUrl: CDN_CSS,
    // Kita inject JS manual lewat customJs
    customJs: [CDN_BUNDLE, CDN_PRESET],
    customSiteTitle: 'Pandai LMS Docs',
    swaggerOptions: {
      persistAuthorization: true,
    },
  })
);

export default router;
