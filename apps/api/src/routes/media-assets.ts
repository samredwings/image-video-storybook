import { Router, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const router = Router();
const prisma = new PrismaClient();

const createAssetSchema = z.object({
  url: z.string().min(1),
  assetType: z.enum(["IMAGE", "VIDEO"]).default("IMAGE"),
  label: z.string().optional(),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

const updateAssetSchema = z.object({
  label: z.string().optional(),
  description: z.string().optional(),
  sceneOrder: z.number().int().optional(),
  metadata: z.record(z.any()).optional(),
});

// POST /api/media-assets — Upload/register a new media asset
router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const data = createAssetSchema.parse(req.body);

    const asset = await prisma.mediaAsset.create({
      data: {
        url: data.url,
        assetType: data.assetType,
        label: data.label,
        description: data.description,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        userId,
      },
    });

    res.status(201).json(asset);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Media asset creation error:", error);
    res.status(500).json({ error: "Failed to create media asset" });
  }
});

// POST /api/media-assets/batch — Upload multiple assets at once
router.post("/batch", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { assets } = z
      .object({
        assets: z.array(createAssetSchema),
      })
      .parse(req.body);

    const created = await Promise.all(
      assets.map((asset) =>
        prisma.mediaAsset.create({
          data: {
            url: asset.url,
            assetType: asset.assetType,
            label: asset.label,
            description: asset.description,
            metadata: asset.metadata ? JSON.stringify(asset.metadata) : null,
            userId,
          },
        }),
      ),
    );

    res.status(201).json(created);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Batch asset creation error:", error);
    res.status(500).json({ error: "Failed to create media assets" });
  }
});

// GET /api/media-assets — List all assets for the user
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { storyId, assetType } = req.query;

    const where: any = { userId };
    if (storyId) where.storyId = storyId;
    if (assetType) where.assetType = assetType;

    const assets = await prisma.mediaAsset.findMany({
      where,
      orderBy: [{ sceneOrder: "asc" }, { createdAt: "desc" }],
    });

    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch media assets" });
  }
});

// GET /api/media-assets/:id
router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const asset = await prisma.mediaAsset.findUnique({
      where: { id },
    });

    if (!asset || asset.userId !== userId) {
      return res.status(404).json({ error: "Media asset not found" });
    }

    res.json(asset);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch media asset" });
  }
});

// PUT /api/media-assets/:id — Update asset metadata
router.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const data = updateAssetSchema.parse(req.body);

    const existing = await prisma.mediaAsset.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: "Media asset not found" });
    }

    const updated = await prisma.mediaAsset.update({
      where: { id },
      data: {
        ...data,
        metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
      },
    });

    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Failed to update media asset" });
  }
});

// DELETE /api/media-assets/:id
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const asset = await prisma.mediaAsset.findUnique({
      where: { id },
    });

    if (!asset || asset.userId !== userId) {
      return res.status(404).json({ error: "Media asset not found" });
    }

    await prisma.mediaAsset.delete({
      where: { id },
    });

    res.json({ message: "Media asset deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete media asset" });
  }
});

export default router;
