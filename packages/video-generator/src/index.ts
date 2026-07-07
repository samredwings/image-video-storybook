import axios from "axios";
import type {
  VideoGenerationRequest,
  VideoGenerationResult,
  VideoProvider,
} from "@storybook/shared";

/**
 * Video Generation Provider Interface
 * All providers support unrestricted content generation
 */
export interface VideoGeneratorProvider {
  name: VideoProvider;
  generate(data: VideoGenerationRequest): Promise<VideoGenerationResult>;
}

// ─── Runway ML Provider ───────────────────────────────────────────────────────

class RunwayProvider implements VideoGeneratorProvider {
  name: VideoProvider = "RUNWAY";

  async generate(data: VideoGenerationRequest): Promise<VideoGenerationResult> {
    const apiKey = process.env.RUNWAY_API_KEY;
    if (!apiKey) throw new Error("RUNWAY_API_KEY not configured");

    const response = await axios.post(
      "https://api.runwayml.com/v1/videos/generate",
      {
        image_url: data.imageUrl,
        prompt: data.prompt,
        duration: data.duration,
        motion_strength: data.motionStrength,
        aspect_ratio: data.aspectRatio || "16:9",
      },
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        timeout: 120000,
      },
    );

    return {
      videoUrl: response.data.video_url,
      thumbnail: response.data.thumbnail_url,
      provider: "RUNWAY",
      duration: data.duration,
    };
  }
}

// ─── Pika Labs Provider ───────────────────────────────────────────────────────

class PikaProvider implements VideoGeneratorProvider {
  name: VideoProvider = "PIKA";

  async generate(data: VideoGenerationRequest): Promise<VideoGenerationResult> {
    const apiKey = process.env.PIKA_API_KEY;
    if (!apiKey) throw new Error("PIKA_API_KEY not configured");

    const response = await axios.post(
      "https://api.pika.art/v1/videos/generate",
      {
        image_url: data.imageUrl,
        prompt: data.prompt,
        duration: data.duration,
      },
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        timeout: 120000,
      },
    );

    return {
      videoUrl: response.data.video_url,
      thumbnail: response.data.thumbnail_url,
      provider: "PIKA",
      duration: data.duration,
    };
  }
}

// ─── CogVideoX Provider ───────────────────────────────────────────────────────

class CogVideoXProvider implements VideoGeneratorProvider {
  name: VideoProvider = "COGVIDEOX";

  async generate(data: VideoGenerationRequest): Promise<VideoGenerationResult> {
    const response = await axios.post(
      "https://cogvideox-service.example.com/generate",
      {
        image_url: data.imageUrl,
        prompt: data.prompt,
        duration: data.duration,
        motion_strength: data.motionStrength,
      },
      { timeout: 180000 },
    );

    return {
      videoUrl: response.data.video_url,
      thumbnail: response.data.thumbnail_url,
      provider: "COGVIDEOX",
      duration: data.duration,
    };
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

const providers: Record<VideoProvider, VideoGeneratorProvider> = {
  RUNWAY: new RunwayProvider(),
  PIKA: new PikaProvider(),
  COGVIDEOX: new CogVideoXProvider(),
};

export function getProvider(name: VideoProvider): VideoGeneratorProvider {
  const provider = providers[name];
  if (!provider) throw new Error(`Unsupported video provider: ${name}`);
  return provider;
}

export async function generateVideo(
  data: VideoGenerationRequest,
): Promise<VideoGenerationResult> {
  const provider = getProvider(data.provider);
  return provider.generate(data);
}

export const availableProviders = Object.keys(providers) as VideoProvider[];

export default { generateVideo, getProvider, availableProviders };
