import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

const exportSchema = z.object({
  storyId: z.string(),
  format: z.enum(['pdf', 'epub', 'html', 'markdown', 'docx']),
  includeImages: z.boolean().default(true),
  includeMetadata: z.boolean().default(true),
});

const publishSchema = z.object({
  storyId: z.string(),
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  visibility: z.enum(['public', 'private', 'unlisted']).default('public'),
  allowComments: z.boolean().default(true),
});

// POST /api/export/story
router.post('/story', async (req: AuthRequest, res: Response) => {
  try {
    const data = exportSchema.parse(req.body);

    // Generate export based on format
    const exportUrl = await generateExport(data);

    res.json({
      success: true,
      exportUrl,
      format: data.format,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Export failed' });
  }
});

// POST /api/publish/story
router.post('/story', async (req: AuthRequest, res: Response) => {
  try {
    const data = publishSchema.parse(req.body);

    // Publish story
    const publishedUrl = await publishStory(data);

    res.json({
      success: true,
      publishedUrl,
      visibility: data.visibility,
      publishedAt: new Date(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Publishing failed' });
  }
});

async function generateExport(data: any): Promise<string> {
  // Implementation for export generation
  return 'https://example.com/exports/story-123.pdf';
}

async function publishStory(data: any): Promise<string> {
  // Implementation for story publishing
  return 'https://storybook.io/stories/story-123';
}

export default router;
