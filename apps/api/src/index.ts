import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import 'express-async-errors';
import pinoHttp from 'pino-http';

import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';

// Routes
import authRoutes from './routes/auth';
import storyboardRoutes from './routes/storyboards';
import characterRoutes from './routes/characters';
import storyRoutes from './routes/stories';
import sceneRoutes from './routes/scenes';
import nsfwRoutes from './routes/nsfw';
import dashboardRoutes from './routes/dashboard';
import modelsRoutes from './routes/models';
import creativeRoutes from './routes/creative';
import videosRoutes from './routes/videos';
import publishingRoutes from './routes/publishing';
import roleplayRoutes from './routes/roleplay';

const app = express();

// Middleware
app.use(cors(config.cors));
app.use(pinoHttp());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes
app.use('/api/auth', authRoutes);
app.use('/api/models', modelsRoutes);

// Protected routes
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/storyboards', authMiddleware, storyboardRoutes);
app.use('/api/characters', authMiddleware, characterRoutes);
app.use('/api/stories', authMiddleware, storyRoutes);
app.use('/api/scenes', authMiddleware, sceneRoutes);
app.use('/api/content/nsfw', authMiddleware, nsfwRoutes);
app.use('/api/creative', authMiddleware, creativeRoutes);
app.use('/api/videos', authMiddleware, videosRoutes);
app.use('/api/publish', authMiddleware, publishingRoutes);
app.use('/api/export', authMiddleware, publishingRoutes);
app.use('/api/roleplay', authMiddleware, roleplayRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 API server running on port ${PORT}`);
  console.log(`✨ Uncensored Model Support: ENABLED`);
  console.log(`🔥 NSFW Roleplay AI: ACTIVE`);
  console.log(`🎬 Video Generation: READY`);
});

export default app;
