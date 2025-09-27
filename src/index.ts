import express, { Request, Response, Application } from 'express';
import swaggerUi from 'swagger-ui-express';
import { supabase } from './config/supabase';
import { swaggerSpec } from './config/swagger';
import routes from './routes';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'LISAR API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
  }
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// API Routes
app.use('/api/v1', routes);

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'LISAR API - Fiat onramp, wallet management, and delegation service',
    status: 'running',
    timestamp: new Date().toISOString(),
    supabase: supabase ? 'connected' : 'not configured',
    documentation: `${req.protocol}://${req.get('host')}/api-docs`
  });
});



// Start server
app.listen(PORT, () => {
  console.log(`🚀 LISAR API server is running on port ${PORT}`);
  console.log(`📍 Access the API at http://localhost:${PORT}`);
  console.log(`📚 API Documentation at http://localhost:${PORT}/api-docs`);
  console.log(`🔗 Supabase: ${supabase ? '✅ Connected' : '❌ Not configured'}`);
});

export default app;
