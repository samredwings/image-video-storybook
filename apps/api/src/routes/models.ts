import { Router, Response } from 'express';
import axios from 'axios';
import { config } from '../config';
import { z } from 'zod';

const router = Router();

const UNCENSORED_MODELS = [
  {
    id: 'huggingface-llama2-uncensored',
    name: 'Llama 2 Uncensored',
    provider: 'huggingface',
    endpoint: 'https://huggingface.co/spaces/georgesung/llama2_7b_chat_uncensored',
    description: 'Llama 2 without safety filters - Excellent for erotic content',
    supportsErotic: true,
  },
  {
    id: 'huggingface-mistral-uncensored',
    name: 'Mistral 7B Uncensored',
    provider: 'huggingface',
    endpoint: 'https://huggingface.co/spaces/mistralai/Mistral-7B-Instruct-v0.1',
    description: 'Mistral without content restrictions',
    supportsErotic: true,
  },
  {
    id: 'huggingface-neural-chat',
    name: 'Neural Chat 7B',
    provider: 'huggingface',
    endpoint: 'https://huggingface.co/spaces/Intel/neural-chat-7b-v3-1',
    description: 'Unrestricted neural chat model',
    supportsErotic: true,
  },
  {
    id: 'local-llama2',
    name: 'Local Llama 2 Uncensored',
    provider: 'local',
    endpoint: 'http://localhost:8000',
    description: 'Self-hosted uncensored Llama 2 for maximum privacy',
    supportsErotic: true,
  },
];

const generateStorySchema = z.object({
  prompt: z.string().min(10),
  genre: z.enum(['ROMANCE', 'FANTASY', 'SCI_FI', 'DRAMA', 'MYSTERY', 'ADVENTURE', 'EROTICA', 'THRILLER', 'HORROR', 'COMEDY', 'OTHER']),
  contentRating: z.enum(['G', 'PG', 'PG_13', 'R', 'NC_17', 'X']),
  modelId: z.string(),
  maxTokens: z.number().default(2000).max(4000),
  temperature: z.number().default(0.8).min(0).max(1),
  characterIds: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

// GET /api/models/uncensored
router.get('/uncensored', (req, res) => {
  res.json({
    models: UNCENSORED_MODELS,
    note: 'These models support unrestricted content generation including erotic material',
  });
});

// POST /api/stories/generate-uncensored
router.post('/generate-uncensored', async (req, res) => {
  try {
    const data = generateStorySchema.parse(req.body);
    const model = UNCENSORED_MODELS.find((m) => m.id === data.modelId);

    if (!model) {
      return res.status(400).json({ error: 'Invalid model ID' });
    }

    let generatedContent;

    if (model.provider === 'huggingface') {
      generatedContent = await generateWithHuggingFace(data.prompt, model, data);
    } else if (model.provider === 'local') {
      generatedContent = await generateWithLocalModel(data.prompt, model, data);
    } else {
      throw new Error('Unsupported provider');
    }

    res.json({
      success: true,
      content: generatedContent,
      model: model.name,
      genre: data.genre,
      contentRating: data.contentRating,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Story generation error:', error);
    res.status(500).json({ error: 'Failed to generate story' });
  }
});

async function generateWithHuggingFace(
  prompt: string,
  model: any,
  options: any
): Promise<string> {
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf',
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: options.maxTokens,
          temperature: options.temperature,
          top_p: 0.95,
          do_sample: true,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        },
      }
    );

    return response.data[0].generated_text;
  } catch (error) {
    console.error('HuggingFace generation error:', error);
    throw new Error('Failed to generate with HuggingFace model');
  }
}

async function generateWithLocalModel(
  prompt: string,
  model: any,
  options: any
): Promise<string> {
  try {
    const response = await axios.post(`${model.endpoint}/generate`, {
      prompt,
      max_tokens: options.maxTokens,
      temperature: options.temperature,
    });

    return response.data.text;
  } catch (error) {
    console.error('Local model generation error:', error);
    throw new Error('Failed to generate with local model');
  }
}

export default router;
