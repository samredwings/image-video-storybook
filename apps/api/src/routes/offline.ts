import { Router, Response } from 'express';
import axios from 'axios';
import { config } from '../config';
import { z } from 'zod';

const router = Router();

const OFFLINE_MODELS = [
  {
    id: 'llama-2-7b-q4',
    name: 'Llama 2 7B Quantized (Q4)',
    size: '3.5GB',
    ramRequired: '6GB',
    platform: ['android', 'ios', 'web'],
    uncensored: true,
    supportsAdultContent: true,
  },
  {
    id: 'mistral-7b-q4',
    name: 'Mistral 7B Quantized (Q4)',
    size: '3.8GB',
    ramRequired: '6GB',
    uncensored: true,
    supportsAdultContent: true,
  },
  {
    id: 'stable-diffusion-mobile',
    name: 'Stable Diffusion Mobile',
    size: '1.8GB',
    ramRequired: '3GB',
    uncensored: true,
    supportsAdultContent: true,
  },
];

const offlineGenerationSchema = z.object({
  prompt: z.string().min(10),
  modelId: z.string(),
  contentType: z.enum(['text', 'image', 'video']),
  adultContent: z.boolean().default(true),
});

router.get('/models', (req, res) => {
  res.json({
    models: OFFLINE_MODELS,
    note: 'All models support unrestricted adult content generation',
  });
});

router.post('/generate', async (req, res) => {
  try {
    const data = offlineGenerationSchema.parse(req.body);
    res.json({
      success: true,
      message: 'Offline generation initiated',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Generation failed' });
  }
});

export default router;
