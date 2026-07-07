import express from "express";
import cors from "cors";
import "express-async-errors";
import pinoHttp from "pino-http";

import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler";
import { authMiddleware } from "./middleware/auth";

// Routes
import authRoutes from "./routes/auth";
import storyboardRoutes from "./routes/storyboards";
import characterRoutes from "./routes/characters";
import storyRoutes from "./routes/stories";
import sceneRoutes from "./routes/scenes";
import dashboardRoutes from "./routes/dashboard";
import modelsRoutes from "./routes/models";
import creativeRoutes from "./routes/creative";
import videosRoutes from "./routes/videos";
import publishingRoutes from "./routes/publishing";
import roleplayRoutes from "./routes/roleplay";
import offlineRoutes from "./routes/offline";
import unrestrictedRoutes from "./routes/unrestricted";
import nsfwRoutes from "./routes/nsfw";
import userKeysRoutes from "./routes/user-keys";

const app = express();

app.use(cors(config.cors));
app.use(
  pinoHttp({ level: config.nodeEnv === "production" ? "info" : "debug" }),
);
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    mode: "UNRESTRICTED",
    pricing:
      "FREE — no paid API keys required. BYOK available for premium providers.",
  });
});

// Public routes
app.use("/api/auth", authRoutes);
app.use("/api/models", modelsRoutes);
app.use("/api/offline", offlineRoutes);

// Protected routes
app.use("/api/dashboard", authMiddleware, dashboardRoutes);
app.use("/api/storyboards", authMiddleware, storyboardRoutes);
app.use("/api/characters", authMiddleware, characterRoutes);
app.use("/api/stories", authMiddleware, storyRoutes);
app.use("/api/scenes", authMiddleware, sceneRoutes);
app.use("/api/creative", authMiddleware, creativeRoutes);
app.use("/api/videos", authMiddleware, videosRoutes);
app.use("/api/publish", authMiddleware, publishingRoutes);
app.use("/api/export", authMiddleware, publishingRoutes);
app.use("/api/roleplay", authMiddleware, roleplayRoutes);
app.use("/api/unrestricted", authMiddleware, unrestrictedRoutes);
app.use("/api/content", authMiddleware, nsfwRoutes);
app.use("/api/user/keys", authMiddleware, userKeysRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found", path: req.path });
});

// ─── Start Server ─────────────────────────────────────────────────────────────

const PORT = config.port;

app.listen(PORT, () => {
  console.log("");
  console.log(
    "╔═══════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║              STORYBOOK STUDIO — FREE CREATIVE API           ║",
  );
  console.log(
    "╠═══════════════════════════════════════════════════════════════╣",
  );
  console.log(
    `║  Mode:      UNRESTRICTED  —  No content restrictions active   ║`,
  );
  console.log(
    `║  Pricing:   FREE  —  No paid API keys required                ║`,
  );
  console.log(
    `║  Port:      ${String(PORT).padEnd(10)}                                          ║`,
  );
  console.log(
    `║  Environment: ${config.nodeEnv.padEnd(10)}                                       ║`,
  );
  console.log(
    "╠═══════════════════════════════════════════════════════════════╣",
  );
  console.log(
    "║  FEATURES:                                                   ║",
  );
  console.log(
    "║  ✓ AI Story Generation (Free — HuggingFace)                  ║",
  );
  console.log(
    "║  ✓ Adult Content — No Restrictions                           ║",
  );
  console.log(
    "║  ✓ NSFW Roleplay AI Companion                                ║",
  );
  console.log(
    "║  ✓ Video Generation (Free — CogVideoX)                       ║",
  );
  console.log(
    "║  ✓ Image Generation (Free — Stable Diffusion XL)             ║",
  );
  console.log(
    "║  ✓ Uncensored Model Support (HuggingFace / Local)            ║",
  );
  console.log(
    "║  ✓ BYOK — Bring Your Own Key for premium providers           ║",
  );
  console.log(
    "║  ✓ Offline Mode for Low-RAM Devices                          ║",
  );
  console.log(
    "║  ✓ Bull Queue — Async Job Processing                         ║",
  );
  console.log(
    "║  ✓ Redis Caching Layer                                       ║",
  );
  console.log(
    "╚═══════════════════════════════════════════════════════════════╝",
  );
  console.log("");
  console.log(
    "  🆓  Free Tier:  HuggingFace (free signup) for text, images & video",
  );
  console.log(
    "  🔑  BYOK:       OpenAI GPT-4, Runway ML, Pika Labs, ElevenLabs",
  );
  console.log("");
});

export default app;
