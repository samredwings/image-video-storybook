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
import dashboardRoutes from './routes/dashboard';
import modelsRoutes from './routes/models';
import creativeRoutes from './routes/creative';
import videosRoutes from './routes/videos';
import publishingRoutes from './routes/publishing';
import roleplayRoutes from './routes/roleplay';
import offlineRoutes from './routes/offline';
import unrestrictedRoutes from './routes/unrestricted';

const app = express();

app.use(cors(config.cors));
app.use(pinoHttp());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes
app.use('/api/auth', authRoutes);
app.use('/api/models', modelsRoutes);
app.use('/api/offline', offlineRoutes);

// Protected routes
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/storyboards', authMiddleware, storyboardRoutes);
app.use('/api/characters', authMiddleware, characterRoutes);
app.use('/api/stories', authMiddleware, storyRoutes);
app.use('/api/scenes', authMiddleware, sceneRoutes);
app.use('/api/creative', authMiddleware, creativeRoutes);
app.use('/api/videos', authMiddleware, videosRoutes);
app.use('/api/publish', authMiddleware, publishingRoutes);
app.use('/api/export', authMiddleware, publishingRoutes);
app.use('/api/roleplay', authMiddleware, roleplayRoutes);
app.use('/api/unrestricted', authMiddleware, unrestrictedRoutes);

app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`\n✨ === IMAGE-TO-VIDEO STORYBOOK STUDIO ===`);
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`\n🔥 FEATURES ENABLED:`);
  console.log(`  ✅ Uncensored Model Support`);
  console.log(`  🔥 NSFW Roleplay AI Companion`);
  console.log(`  🎬 Video Generation with Facial Accuracy`);
  console.log(`  📱 Offline Model Support for Low-RAM Devices`);
  console.log(`  💎 Adult Content Generation - NO RESTRICTIONS`);
  console.log(`  🎯 Facial Preservation - MAXIMUM ACCURACY`);
  console.log(`\n✨ READY FOR PRODUCTION\n`);
});

export default app;
