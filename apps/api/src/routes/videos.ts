import { Router, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { PrismaClient } from "@prisma/client";
import Queue from "bull";
import { z } from "zod";

const router = Router();
const prisma = new PrismaClient();

// ─── Bull Queue for Video Generation ──────────────────────────────────────────

const videoQueue = new Queue(
  "video-generation",
  process.env.REDIS_URL || "redis://localhost:6379",
  {
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    },
  },
);

// ─── Validation Schema ────────────────────────────────────────────────────────

const generateVideoSchema = z.object({
  sceneId: z.string(),
  imageUrl: z.string().url(),
  prompt: z.string(),
  duration: z.number().default(5),
  motionStrength: z.number().default(0.7),
  provider: z.enum(["RUNWAY", "PIKA", "COGVIDEOX"]).default("RUNWAY"),
  aspectRatio: z.enum(["16:9", "9:16", "1:1"]).default("16:9"),
  quality: z.enum(["standard", "high", "cinema"]).default("high"),
});

// ─── POST /api/videos/generate ────────────────────────────────────────────────

router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const data = generateVideoSchema.parse(req.body);

    // Verify scene ownership
    const scene = await prisma.scene.findUnique({
      where: { id: data.sceneId },
      include: { story: true },
    });

    if (!scene || scene.story?.userId !== userId) {
      return res.status(404).json({ error: "Scene not found" });
    }

    // Update scene status
    await prisma.scene.update({
      where: { id: data.sceneId },
      data: { status: "GENERATING_VIDEO" },
    });

    // Create generation job in database
    const job = await prisma.generationJob.create({
      data: {
        sceneId: data.sceneId,
        provider: data.provider,
        status: "QUEUED",
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

    // Add to Bull queue for async processing
    await videoQueue.add(
      {
        jobId: job.id,
        sceneId: data.sceneId,
        provider: data.provider,
        prompt: data.prompt,
        imageUrl: data.imageUrl,
        motionStrength: data.motionStrength,
        duration: data.duration,
        metadata: { aspectRatio: data.aspectRatio, quality: data.quality },
        userId,
      },
      {
        jobId: job.id,
        priority:
          data.quality === "cinema" ? 1 : data.quality === "high" ? 2 : 3,
      },
    );

    res.status(202).json({
      success: true,
      jobId: job.id,
      status: "QUEUED",
      message: "Video generation queued successfully",
      estimatedTime: data.provider === "COGVIDEOX" ? 180 : 120,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Video generation error:", error);
    res.status(500).json({ error: "Failed to generate video" });
  }
});

// ─── GET /api/videos/job/:jobId ───────────────────────────────────────────────

router.get("/job/:jobId", async (req: AuthRequest, res: Response) => {
  try {
    const { jobId } = req.params;

    const job = await prisma.generationJob.findUnique({
      where: { id: jobId },
      include: { scenes: true },
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Also check Bull queue for real-time status
    let queueStatus = null;
    try {
      const bullJob = await videoQueue.getJob(jobId);
      if (bullJob) {
        queueStatus = {
          bullStatus: await bullJob.getState(),
          attemptsMade: bullJob.attemptsMade,
          timestamp: bullJob.timestamp,
        };
      }
    } catch {
      // Bull queue might not be connected; fall back to DB status
    }

    res.json({
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      resultVideoUrl: job.resultVideoUrl,
      resultThumbnail: job.resultThumbnail,
      errorMessage: job.errorMessage,
      retryCount: job.retryCount,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      completedAt: job.completedAt,
      ...(queueStatus && { queue: queueStatus }),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch job status" });
  }
});

// ─── GET /api/videos/providers ────────────────────────────────────────────────

router.get("/providers", async (_req: AuthRequest, res: Response) => {
  res.json({
    providers: [
      {
        id: "RUNWAY",
        name: "Runway ML",
        description: "Advanced AI video generation",
        supportsAdultContent: true,
      },
      {
        id: "PIKA",
        name: "Pika Labs",
        description: "Creative video generation",
        supportsAdultContent: true,
      },
      {
        id: "COGVIDEOX",
        name: "CogVideoX",
        description: "Open-source video generation",
        supportsAdultContent: true,
      },
    ],
    unrestrictedMode: true,
  });
});

export default router;
