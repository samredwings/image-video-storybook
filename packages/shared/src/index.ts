// ─── Enums ────────────────────────────────────────────────────────────────────

export enum ContentGenre {
  ROMANCE = "ROMANCE",
  FANTASY = "FANTASY",
  SCI_FI = "SCI_FI",
  DRAMA = "DRAMA",
  MYSTERY = "MYSTERY",
  ADVENTURE = "ADVENTURE",
  EROTICA = "EROTICA",
  THRILLER = "THRILLER",
  HORROR = "HORROR",
  COMEDY = "COMEDY",
  OTHER = "OTHER",
}

export enum ContentRating {
  G = "G",
  PG = "PG",
  PG_13 = "PG_13",
  R = "R",
  NC_17 = "NC_17",
  X = "X",
  XXX = "XXX",
}

export enum StoryStatus {
  DRAFT = "DRAFT",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

export enum SceneStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  GENERATING_VIDEO = "GENERATING_VIDEO",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export enum JobStatus {
  QUEUED = "QUEUED",
  PROCESSING = "PROCESSING",
  GENERATING = "GENERATING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export enum VideoProvider {
  RUNWAY = "RUNWAY",
  PIKA = "PIKA",
  COGVIDEOX = "COGVIDEOX",
}

export enum UserRole {
  ADMIN = "ADMIN",
  CREATOR = "CREATOR",
  USER = "USER",
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VideoGenerationRequest {
  sceneId: string;
  imageUrl: string;
  prompt: string;
  duration: number;
  motionStrength: number;
  provider: VideoProvider;
  aspectRatio?: "16:9" | "9:16" | "1:1";
  quality?: "standard" | "high" | "cinema";
}

export interface VideoGenerationResult {
  videoUrl: string;
  thumbnail: string;
  provider: VideoProvider;
  duration: number;
}

export interface StoryGenerationRequest {
  title: string;
  prompt: string;
  genre: ContentGenre;
  contentRating: ContentRating;
  characterIds?: string[];
  tags?: string[];
  temperature?: number;
  maxTokens?: number;
}

export interface CharacterProfile {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  personality?: Record<string, any>;
  appearance?: Record<string, any>;
  background?: string;
  traits?: string[];
}

export interface GenerationJobData {
  jobId: string;
  sceneId: string;
  provider: VideoProvider;
  prompt: string;
  imageUrl: string;
  motionStrength: number;
  duration: number;
  metadata?: Record<string, any>;
  userId: string;
}

export interface DashboardStats {
  storyboards: number;
  stories: number;
  characters: number;
  totalScenes: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
