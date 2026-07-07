import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: parseInt(process.env.API_PORT || "3001"),
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "dev-secret-key-change-in-production",
  jwtExpire: process.env.JWT_EXPIRE || "7d",
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || "us-east-1",
    s3Bucket: process.env.AWS_S3_BUCKET,
  },
  ai: {
    runwayApiKey: process.env.RUNWAY_API_KEY,
    pikaApiKey: process.env.PIKA_API_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY,
    huggingfaceApiKey: process.env.HUGGINGFACE_API_KEY,
    elevenlabsApiKey: process.env.ELEVENLABS_API_KEY,
  },
  content: {
    adultContentAllowed: true,
    nsfwDetectionEnabled: false,
    unrestrictedMode: true,
  },
};
