import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

const generateVideoSchema = z.object({
  sceneId: z.string(),
  imageUrl: z.string().url(),
  prompt: z.string(),
  duration: z.number().default(5),
  motionStrength: z.number().default(0.7),
  provider: z.enum(['RUNWAY', 'PIKA', 'COGVIDEOX']).default('RUNWAY'),
  aspectRatio: z.enum(['16:9', '9:16', '1:1']).default('16:9'),
  quality: z.enum(['standard', 'high', 'cinema']).default('high'),
});

const VIDEO_GENERATION_QUEUE: any[] = [];

// POST /api/videos/generate
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const data = generateVideoSchema.parse(req.body);

    const scene = await prisma.scene.findUnique({
      where: { id: data.sceneId },
      include: {
        story: true,
      },
    });

    if (!scene || scene.story?.userId !== userId) {
      return res.status(404).json({ error: 'Scene not found' });
    }

    // Create generation job
    const job = await prisma.generationJob.create({
      data: {
        sceneId: data.sceneId,
        provider: data.provider,
        status: 'QUEUED',
        prompt: data.prompt,
        imageUrl: data.imageUrl,
        motionStrength: data.motionStrength,
        duration: data.duration,
        metadata: JSON.stringify({
          aspectRatio: data.aspectRatio,
          quality: data.quality,
        }),
      },
    });

    // Queue for processing
    VIDEO_GENERATION_QUEUE.push(job);

    // Start async processing
    processVideoGeneration(job, data).catch((error) => {
      console.error('Video generation failed:', error);
    });

    res.status(202).json({
      success: true,
      jobId: job.id,
      status: 'QUEUED',
      message: 'Video generation queued successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Video generation error:', error);
    res.status(500).json({ error: 'Failed to generate video' });
  }
});

// GET /api/videos/job/:jobId
router.get('/job/:jobId', async (req: AuthRequest, res: Response) => {
  try {
    const { jobId } = req.params;

    const job = await prisma.generationJob.findUnique({
      where: { id: jobId },
      include: {
        scenes: true,
      },
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      resultVideoUrl: job.resultVideoUrl,
      resultThumbnail: job.resultThumbnail,
      errorMessage: job.errorMessage,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch job status' });
  }
});

// Helper function to process video generation
async function processVideoGeneration(job: any, data: any) {
  try {
    await prisma.generationJob.update({
      where: { id: job.id },
      data: { status: 'PROCESSING' },
    });

    let videoUrl: string;
    let thumbnail: string;

    if (data.provider === 'RUNWAY') {
      ({ videoUrl, thumbnail } = await generateWithRunway(data));
    } else if (data.provider === 'PIKA') {
      ({ videoUrl, thumbnail } = await generateWithPika(data));
    } else if (data.provider === 'COGVIDEOX') {
      ({ videoUrl, thumbnail } = await generateWithCogVideoX(data));
    } else {
      throw new Error('Unsupported provider');
    }

    await prisma.generationJob.update({
      where: { id: job.id },
      data: {
        status: 'COMPLETED',
        progress: 100,
        resultVideoUrl: videoUrl,
        resultThumbnail: thumbnail,
        completedAt: new Date(),
      },
    });

    // Update scene with video
    await prisma.scene.update({
      where: { id: job.sceneId },
      data: {
        videoUrl,
        status: 'COMPLETED',
      },
    });
  } catch (error) {
    console.error('Video generation processing error:', error);
    await prisma.generationJob.update({
      where: { id: job.id },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
}

async function generateWithRunway(data: any): Promise<{ videoUrl: string; thumbnail: string }> {
  try {
    const response = await axios.post(
      'https://api.runwayml.com/v1/videos/generate',
      {
        image_url: data.imageUrl,
        prompt: data.prompt,
        duration: data.duration,
        motion_strength: data.motionStrength,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.RUNWAY_API_KEY}`,
        },
      }
    );

    return {
      videoUrl: response.data.video_url,
      thumbnail: response.data.thumbnail_url,
    };
  } catch (error) {
    throw new Error('Runway video generation failed');
  }
}

async function generateWithPika(data: any): Promise<{ videoUrl: string; thumbnail: string }> {
  try {
    const response = await axios.post(
      'https://api.pika.art/v1/videos/generate',
      {
        image_url: data.imageUrl,
        prompt: data.prompt,
        duration: data.duration,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PIKA_API_KEY}`,
        },
      }
    );

    return {
      videoUrl: response.data.video_url,
      thumbnail: response.data.thumbnail_url,
    };
  } catch (error) {
    throw new Error('Pika video generation failed');
  }
}

async function generateWithCogVideoX(data: any): Promise<{ videoUrl: string; thumbnail: string }> {
  try {
    const response = await axios.post(
      'https://cogvideox-service.example.com/generate',
      {
        image_url: data.imageUrl,
        prompt: data.prompt,
        duration: data.duration,
        motion_strength: data.motionStrength,
      }
    );

    return {
      videoUrl: response.data.video_url,
      thumbnail: response.data.thumbnail_url,
    };
  } catch (error) {
    throw new Error('CogVideoX generation failed');
  }
}

export default router;
