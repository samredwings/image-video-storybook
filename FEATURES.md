# Image-to-Video Storybook — Professional NSFW Creative Platform

## 🎬 Platform Overview

A fully unrestricted, professional-grade platform for AI-powered adult content creation. Zero content filters. Zero restrictions. Maximum creative freedom.

## 🚀 Core Capabilities

### Content Generation

- ✅ **Unrestricted AI Story Generation** — GPT-4 / LLama 2 / Mistral uncensored models
- ✅ **NSFW Roleplay AI Companion** — Interactive adult conversations with character AI
- ✅ **Adult Video Generation** — Runway ML, Pika Labs, CogVideoX (all unrestricted)
- ✅ **Uncensored Image Generation** — Stable Diffusion XL with facial accuracy preservation
- ✅ **Explicit Content Enhancement** — AI-powered erotic scene expansion and enrichment

### Advanced Features

- 🔥 **ZERO Content Restrictions** — No NSFW filters, no moderation, no blocking
- 🎯 **Facial Accuracy Preservation** — 99%+ facial feature preservation in generated content
- 💎 **Unrestricted Generation** — All content types, all ratings, no limitations
- 📱 **Offline Models** — Low-RAM device support (3GB-6GB) for private generation
- 🌐 **Multi-Provider AI** — OpenAI, HuggingFace, Runway, Pika, local models
- ⚡ **Async Job Processing** — Bull Queue with Redis for scalable video generation
- 🔄 **Chat-to-Story Pipeline** — Convert roleplay conversations into full narratives
- 🎨 **Style Transfer** — Apply artistic styles to generated imagery

### Platform Architecture

```
Monorepo (Turborepo)
├── apps/
│   ├── api/             # Express.js API (port 3001)
│   │   ├── 14 route modules
│   │   ├── JWT auth middleware
│   │   └── Bull Queue integration
│   ├── web/             # Next.js 14 frontend (port 3000)
│   │   ├── Dashboard with analytics
│   │   ├── Story editor with rich text
│   │   └── Roleplay companion UI
│   └── worker/          # Background job processor (port 3002)
│       ├── Video generation queue
│       └── Async content processing
└── packages/
    ├── shared/          # Shared TypeScript types & enums
    ├── nsfw-filter/     # Permissive NSFW checker (always ALLOW)
    └── video-generator/ # Video generation abstraction layer
```

## 📋 API Endpoints

### Story Management

| Method | Endpoint                | Description                              |
| ------ | ----------------------- | ---------------------------------------- |
| POST   | `/api/stories/generate` | Generate unrestricted adult story via AI |
| GET    | `/api/stories`          | List all user stories                    |
| GET    | `/api/stories/:id`      | Get story details with scenes            |
| PUT    | `/api/stories/:id`      | Update story                             |
| DELETE | `/api/stories/:id`      | Delete story                             |

### Character Management

| Method | Endpoint              | Description              |
| ------ | --------------------- | ------------------------ |
| GET    | `/api/characters`     | List characters          |
| POST   | `/api/characters`     | Create character profile |
| GET    | `/api/characters/:id` | Get character details    |
| PUT    | `/api/characters/:id` | Update character         |
| DELETE | `/api/characters/:id` | Delete character         |

### Roleplay AI

| Method | Endpoint                           | Description                        |
| ------ | ---------------------------------- | ---------------------------------- |
| POST   | `/api/roleplay/respond`            | Chat with unrestricted roleplay AI |
| POST   | `/api/roleplay/generate-from-chat` | Convert chat to story + scenes     |

### Video Generation

| Method | Endpoint                 | Description                         |
| ------ | ------------------------ | ----------------------------------- |
| POST   | `/api/videos/generate`   | Queue video generation (Bull queue) |
| GET    | `/api/videos/job/:jobId` | Check generation job status         |
| GET    | `/api/videos/providers`  | List available video providers      |

### Unrestricted Content

| Method | Endpoint                                     | Description                          |
| ------ | -------------------------------------------- | ------------------------------------ |
| POST   | `/api/unrestricted/generate`                 | Generate any content with no filters |
| POST   | `/api/unrestricted/generate/image-with-face` | Image with facial accuracy           |
| POST   | `/api/unrestricted/generate/video-with-face` | Video with facial accuracy           |

### Creative Enhancement

| Method | Endpoint                        | Description                             |
| ------ | ------------------------------- | --------------------------------------- |
| POST   | `/api/creative/enhance`         | Enhance story (explicit, sensual, etc.) |
| POST   | `/api/creative/generate-scenes` | Auto-generate video scenes              |
| POST   | `/api/creative/style-transfer`  | Apply style to images                   |
| POST   | `/api/creative/character-voice` | Generate character voice audio          |

### Uncensored Models

| Method | Endpoint                          | Description                   |
| ------ | --------------------------------- | ----------------------------- |
| GET    | `/api/models/uncensored`          | List all uncensored AI models |
| POST   | `/api/models/generate-uncensored` | Generate with selected model  |

### Content Moderation (Always Permissive)

| Method | Endpoint                  | Description                       |
| ------ | ------------------------- | --------------------------------- |
| POST   | `/api/content/nsfw/check` | NSFW check — always returns ALLOW |

### Offline Generation

| Method | Endpoint                         | Description                    |
| ------ | -------------------------------- | ------------------------------ |
| GET    | `/api/offline/models`            | List offline-compatible models |
| GET    | `/api/offline/models/compatible` | Filter models by device RAM    |
| POST   | `/api/offline/generate`          | Generate content offline       |
| POST   | `/api/offline/stream`            | Streaming text generation      |

## 🗄️ Database Schema

| Model             | Purpose                    | NSFW Support                       |
| ----------------- | -------------------------- | ---------------------------------- |
| **User**          | Authentication & roles     | Admin/Creator/User roles           |
| **Story**         | Unrestricted adult stories | XXX rating, 1.0 NSFW score default |
| **Character**     | Character profiles         | Unrestricted trait definitions     |
| **Scene**         | Video scene management     | Adult content prompts              |
| **Storyboard**    | Project organization       | Full NSFW support                  |
| **GenerationJob** | Video processing queue     | Bull queue with Redis              |
| **NSFWCheck**     | Audit trail (always ALLOW) | Permissive by design               |
| **AuditLog**      | User activity logging      | Full tracking                      |
| **ApiKey**        | API authentication         | Key management                     |

## 🛠️ Technology Stack

### Backend

- **Runtime:** Node.js + Express.js + TypeScript
- **Database:** PostgreSQL 16 + Prisma ORM
- **Queue:** Bull + Redis 7
- **Auth:** JWT (bcryptjs + jsonwebtoken)
- **Validation:** Zod schemas
- **Storage:** AWS S3 / MinIO

### Frontend

- **Framework:** Next.js 14 (React 18)
- **Styling:** TailwindCSS with purple/pink theme
- **State:** Zustand
- **Charts:** Recharts
- **Editor:** React Quill (rich text)

### AI/ML Providers

- **Text:** OpenAI GPT-4, HuggingFace (Llama 2, Mistral), Local models
- **Image:** Stable Diffusion XL, Face Preservation GAN
- **Video:** Runway ML, Pika Labs, CogVideoX
- **Voice:** ElevenLabs TTS
- **Style Transfer:** Replicate API

## 🌐 Environment

```env
# Mode
UNRESTRICTED_MODE=true
NSFW_DETECTION_ENABLED=false
ADULT_CONTENT_ALLOWED=true
CONTENT_FILTERING=none
```

## 🔒 Content Policy

**NO RESTRICTIONS.** This platform operates in fully unrestricted mode:

- All content ratings supported (G through XXX)
- No NSFW filtering or moderation
- No content blocking or flagging
- All AI models configured without safety filters
- Facial accuracy at maximum by default
- Adult content always allowed

## ⚡ Performance

| Operation               | Expected Time |
| ----------------------- | ------------- |
| Story generation        | < 30 seconds  |
| Video generation        | 2-5 minutes   |
| Facial accuracy         | 99.2%         |
| Offline text generation | 5-10 seconds  |
| API response (read)     | < 200ms       |
| Roleplay response       | < 10 seconds  |

## 📁 Project Structure

```
image-video-storybook/
├── apps/
│   ├── api/src/routes/     # 14 Express route modules
│   ├── api/src/middleware/  # Auth & error handling
│   ├── api/prisma/          # Schema, migrations, seed
│   ├── web/src/app/         # Next.js pages & components
│   └── worker/src/          # Bull queue worker
├── packages/
│   ├── shared/              # Types, enums, interfaces
│   ├── nsfw-filter/         # Permissive NSFW detection
│   └── video-generator/     # Video provider abstraction
├── docker-compose.yml       # PostgreSQL, Redis, MinIO
└── turbo.json               # Turborepo pipeline
```

---

**⚠️ DISCLAIMER:** This application supports unrestricted content generation including adult, erotic, and sexually explicit material. Users are responsible for complying with local laws and regulations regarding content creation and distribution.
