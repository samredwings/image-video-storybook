import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

const checkNsfwSchema = z.object({
  imageUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  textContent: z.string().optional(),
  contentType: z.enum(['STORY', 'SCENE', 'VIDEO', 'IMAGE']),
  contentId: z.string(),
});

// POST /api/content/nsfw/check
router.post('/check', async (req: AuthRequest, res: Response) => {
  try {
    const data = checkNsfwSchema.parse(req.body);

    // Multi-model NSFW detection
    let tensorflowScore = 0;
    let openaiScore = 0;
    let customScore = 0;

    if (data.imageUrl) {
      tensorflowScore = await detectNsfwImage(data.imageUrl);
      openaiScore = await checkWithOpenAI(data.imageUrl, 'image');
    }

    if (data.textContent) {
      openaiScore = Math.max(openaiScore, await checkWithOpenAI(data.textContent, 'text'));
      customScore = await checkWithCustomModel(data.textContent);
    }

    const maxScore = Math.max(tensorflowScore, openaiScore, customScore);
    const isFlagged = maxScore > 0.5;

    const nsfwCheck = await prisma.nSFWCheck.create({
      data: {
        contentType: data.contentType,
        contentId: data.contentId,
        imageUrl: data.imageUrl,
        videoUrl: data.videoUrl,
        tensorflowScore,
        openaiScore,
        customScore,
        isFlagged,
        action: isFlagged ? 'FLAG' : 'ALLOW',
        flaggedAt: isFlagged ? new Date() : null,
      },
    });

    res.json({
      isFlagged,
      scores: {
        tensorflow: tensorflowScore,
        openai: openaiScore,
        custom: customScore,
        max: maxScore,
      },
      action: isFlagged ? 'FLAG' : 'ALLOW',
      checkId: nsfwCheck.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('NSFW check error:', error);
    res.status(500).json({ error: 'Failed to check NSFW content' });
  }
});

// Helper functions
async function detectNsfwImage(imageUrl: string): Promise<number> {
  try {
    // Implement TensorFlow.js NSFW model detection
    // This would typically run on the client-side or use a service
    // For now, returning mock value
    return Math.random() * 0.3;
  } catch (error) {
    console.error('TensorFlow NSFW detection error:', error);
    return 0;
  }
}

async function checkWithOpenAI(content: string | string, type: 'text' | 'image'): Promise<number> {
  try {
    // Use OpenAI Moderation API
    // Implementation here
    return Math.random() * 0.2;
  } catch (error) {
    console.error('OpenAI moderation error:', error);
    return 0;
  }
}

async function checkWithCustomModel(text: string): Promise<number> {
  try {
    // Use custom-trained ML model for content detection
    // Implementation here
    return Math.random() * 0.15;
  } catch (error) {
    console.error('Custom model error:', error);
    return 0;
  }
}

export default router;
