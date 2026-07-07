import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

const enhanceStorySchema = z.object({
  storyId: z.string(),
  aspect: z.enum([
    'expand_narrative',
    'add_sensual_descriptions',
    'develop_romance',
    'intensify_emotional_depth',
    'add_dialogue',
    'extend_scenes',
  ]),
  style: z.string().optional(),
  tone: z.string().optional(),
  focusCharacters: z.array(z.string()).optional(),
});

const generateScenesSchema = z.object({
  storyId: z.string(),
  numberOfScenes: z.number().min(1).max(20),
  sceneDuration: z.number().default(5),
  motionIntensity: z.number().min(0).max(1).default(0.7),
  stylePreset: z.enum(['cinematic', 'romantic', 'dramatic', 'artistic', 'erotic']).optional(),
  music: z.boolean().default(true),
  voiceOver: z.boolean().default(false),
});

// POST /api/creative/enhance
router.post('/enhance', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const data = enhanceStorySchema.parse(req.body);

    const story = await prisma.story.findUnique({
      where: { id: data.storyId },
    });

    if (!story || story.userId !== userId) {
      return res.status(404).json({ error: 'Story not found' });
    }

    const enhancedContent = await enhanceStoryContent(story.content, data);

    const updatedStory = await prisma.story.update({
      where: { id: data.storyId },
      data: {
        content: enhancedContent,
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      story: updatedStory,
      enhancement: data.aspect,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Story enhancement error:', error);
    res.status(500).json({ error: 'Failed to enhance story' });
  }
});

// POST /api/creative/generate-scenes
router.post('/generate-scenes', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const data = generateScenesSchema.parse(req.body);

    const story = await prisma.story.findUnique({
      where: { id: data.storyId },
      include: {
        scenes: true,
      },
    });

    if (!story || story.userId !== userId) {
      return res.status(404).json({ error: 'Story not found' });
    }

    const scenes = [];
    const existingSceneCount = story.scenes.length;

    for (let i = 0; i < data.numberOfScenes; i++) {
      const sceneNumber = existingSceneCount + i + 1;
      const sceneDescription = `Scene ${sceneNumber}: [Generated scene from story]`;

      const scene = await prisma.scene.create({
        data: {
          title: `Scene ${sceneNumber}`,
          description: sceneDescription,
          sceneNumber,
          storyId: data.storyId,
          duration: data.sceneDuration,
          motionStrength: data.motionIntensity,
          status: 'PENDING',
        },
      });

      scenes.push(scene);
    }

    res.status(201).json({
      success: true,
      scenesGenerated: scenes.length,
      scenes,
      stylePreset: data.stylePreset,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Scene generation error:', error);
    res.status(500).json({ error: 'Failed to generate scenes' });
  }
});

// POST /api/creative/style-transfer
router.post('/style-transfer', async (req: AuthRequest, res: Response) => {
  try {
    const { imageUrl, style } = req.body;

    if (!imageUrl || !style) {
      return res.status(400).json({ error: 'Image URL and style required' });
    }

    // Use AI model for style transfer
    const styledImage = await applyStyleTransfer(imageUrl, style);

    res.json({
      success: true,
      styledImageUrl: styledImage,
      style,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Style transfer error:', error);
    res.status(500).json({ error: 'Failed to apply style transfer' });
  }
});

// POST /api/creative/character-voice
router.post('/character-voice', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { characterId, dialogue, voiceStyle } = req.body;

    const character = await prisma.character.findUnique({
      where: { id: characterId },
    });

    if (!character || character.userId !== userId) {
      return res.status(404).json({ error: 'Character not found' });
    }

    // Generate voice for character
    const audioUrl = await generateCharacterVoice(dialogue, voiceStyle);

    res.json({
      success: true,
      audioUrl,
      characterId,
      dialogue,
      voiceStyle,
    });
  } catch (error) {
    console.error('Voice generation error:', error);
    res.status(500).json({ error: 'Failed to generate character voice' });
  }
});

// Helper functions
async function enhanceStoryContent(content: string, options: any): Promise<string> {
  const prompts: Record<string, string> = {
    expand_narrative: `Expand and elaborate on the following story with more vivid details and depth:\n\n${content}`,
    add_sensual_descriptions: `Add more sensual and romantic descriptions to the following story, making it more immersive:\n\n${content}`,
    develop_romance: `Enhance the romantic elements and develop the relationship between characters in this story:\n\n${content}`,
    intensify_emotional_depth: `Intensify the emotional depth and character introspection in this story:\n\n${content}`,
    add_dialogue: `Add more realistic and engaging dialogue between characters in this story:\n\n${content}`,
    extend_scenes: `Extend and elaborate on the main scenes in this story with more detail:\n\n${content}`,
  };

  const prompt = prompts[options.aspect] || prompts.expand_narrative;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert creative writing specialist who enhances and improves stories.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 3000,
        temperature: 0.8,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Enhancement error:', error);
    return content;
  }
}

async function applyStyleTransfer(imageUrl: string, style: string): Promise<string> {
  try {
    // Use Replicate or similar API for style transfer
    const response = await axios.post('https://api.replicate.com/v1/predictions', {
      version: 'some-style-transfer-model',
      input: {
        image: imageUrl,
        style,
      },
    });

    return response.data.output[0];
  } catch (error) {
    console.error('Style transfer error:', error);
    throw error;
  }
}

async function generateCharacterVoice(dialogue: string, voiceStyle: string): Promise<string> {
  try {
    // Use ElevenLabs or similar TTS API
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceStyle}`,
      {
        text: dialogue,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      },
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
        },
      }
    );

    return response.data.url;
  } catch (error) {
    console.error('Voice generation error:', error);
    throw error;
  }
}

export default router;
