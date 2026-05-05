import express from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { swaggerOptions } from './docs/swagger.js';
import { authenticateToken } from './middleware/jwtAuth.js';


export const setupCoreDocumentation = (app) => {
  const coreSpecs = swaggerJsdoc(swaggerOptions);
  
  app.use('/api-docs/core', swaggerUi.serve, swaggerUi.setup(coreSpecs, {
    customSiteTitle: 'ClipSphere Core Docs'
  }));
  
  console.log(' Core Database Documentation ready at http://localhost:5000/api-docs/core');
};

const router = express.Router();
router.get('/secure-profile', authenticateToken, (req, res) => {
  res.json({
    status: 'success',
    data: req.user
  });
});

export default router;
