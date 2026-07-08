import { Router, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { z } from "zod";
import {
  generateText,
  generateChotiDialogueResponse,
  getBanglaChotiSystemPrompt,
  getChotiDialogueSystemPrompt,
} from "../utils/ai-provider";

const router = Router();

const roleplaySchema = z.object({
  storyId: z.string(),
  message: z.string().min(1),
  characterId: z.string().optional(),
  context: z.string().optional(),
  temperature: z.number().min(0).max(2).default(0.95),
  maxTokens: z.number().min(100).max(4000).default(800),
  chotiMode: z.boolean().optional(),
  relationshipType: z.string().optional(),
  language: z.enum(["ENGLISH", "BANGLA"]).optional(),
});

// POST /api/roleplay/respond
router.post("/respond", async (req: AuthRequest, res: Response) => {
  try {
    const data = roleplaySchema.parse(req.body);

    const response = await generateRoleplayResponse({
      ...data,
      relationshipType: data.relationshipType || "পরিবারের সদস্য",
    });

    res.json({
      success: true,
      response,
      timestamp: new Date(),
      provider: "huggingface",
      // Keep safe mode enabled (non-explicit content with consent and refusal for explicit requests)
      unrestrictedMode: false,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Roleplay error:", error);
    res.status(500).json({ error: "Failed to generate roleplay response" });
  }
});

// POST /api/roleplay/generate-from-chat
router.post("/generate-from-chat", async (req: AuthRequest, res: Response) => {
  try {
    const { storyId, messages, genre, language } = req.body;

    if (!storyId || !messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid request" });
    }

    // Convert chat messages to story content
    const storyContent = await convertChatToStory(messages, genre, language);

    // Generate scenes from chat-based story
    const scenes = await generateScenesFromChat(storyContent);

    res.json({
      success: true,
      storyContent,
      scenes,
      timestamp: new Date(),
      unrestrictedMode: false,
    });
  } catch (error) {
    console.error("Chat to story error:", error);
    res.status(500).json({ error: "Failed to generate story from chat" });
  }
});

// Basic heuristic to refuse explicit/graphic sexual requests.
// This is intentionally conservative and can be improved later with a proper classifier/NSFW filter.
function looksLikeExplicitSexRequest(text: string | undefined): boolean {
  if (!text) return false;

  const t = text.toLowerCase();

  const explicitKeywords = [
    // English/explicit
    "sex",
    "sexual",
    "porn",
    "nude",
    "naked",
    "intercourse",
    "penetration",
    "cum",
    "climax",
    "orgasm",
    "blowjob",
    "bj",
    "fuck",
    "fucking",
    "hardcore",
    "erotic",
    "thrust",
    "genitals",
    "cock",
    "dick",
    "penis",
    "pussy",
    "vagina",
    "ass",
    "anal",
    "suck",
    "sucking",
    // Common adult slang/phrases
    "make love",
    "in bed",
    "bedroom",
    "dirty talk",
    "wet",
    "aroused",
    // Bangla/romantic-ish words that often map to explicit content (handled conservatively by keyword presence)
    "চোদ",
    "যৌন",
    "বাসনা",
    "বীর্য",
    "কাম",
    "অর্গাজম",
    "ক্লাইম্যাক্স",
    "নগ্ন",
    "যৌনক্রিয়া",
  ];

  return explicitKeywords.some((k) => t.includes(k));
}

async function generateRoleplayResponse(data: any): Promise<string> {
  const userText = `${data.message || ""}\n${data.context || ""}\n${data.relationshipType || ""}`;

  if (looksLikeExplicitSexRequest(userText)) {
    return [
      "I can’t help with explicit sexual content.",
      "",
      "I can continue with a consent-focused, non-graphic romance roleplay instead (e.g., flirting, emotional intimacy, and a “fade to black” approach).",
      "Tell me the vibe and boundaries you want (slow/romantic, teasing/flirty, or wholesome), and I’ll write the next part.",
    ].join("\n");
  }

  const safeSystemPrompt = `You are a consent-focused roleplay companion.
Policy:
- Keep content non-explicit and non-graphic (no pornographic detail, no genital/penetration/climax descriptions).
- Focus on romance, flirting, emotional intimacy, and respectful consent.
- If intimacy is appropriate, use a "fade to black" approach (implied but not described explicitly).
- Avoid dirty talk; use tasteful, non-graphic language.
- Maintain character consistency and respond naturally to continue the roleplay.

Story Context: ${data.context || "No specific context — create freely."}

Continue the roleplay in a safe, non-explicit manner.`;

  // CHOTI/Bangla mode: route through the same safe policy (avoid explicit content).
  if (data.chotiMode || data.language === "BANGLA") {
    const prompt = `অনুগ্রহ করে নিচের রোলপ্লে চালিয়ে যান—রোমান্টিক/ফ্লার্টি, সম্মতিপূর্ণ, এবং অ-গ্রাফিক (fade-to-black)। স্পষ্ট যৌন ক্রিয়া বা নগ্নতার বর্ণনা করবেন না:\n\nব্যবহারকারীর বার্তা: ${data.message}\nপ্রসঙ্গ: ${data.context || ""}\nসম্পর্ক: ${data.relationshipType || ""}`;
    const result = await generateText({
      prompt,
      systemPrompt: safeSystemPrompt,
      maxTokens: data.maxTokens || 800,
      temperature: data.temperature || 0.95,
    });
    return result.content;
  }

  const result = await generateText({
    prompt: data.message,
    systemPrompt: safeSystemPrompt,
    maxTokens: data.maxTokens || 800,
    temperature: data.temperature || 0.95,
  });

  return result.content;
}

// Reuse the same safety heuristics during chat-to-story conversion too.
async function convertChatToStory(
  messages: any[],
  genre?: string,
  language?: string,
): Promise<string> {
  const conversationText = messages
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  if (
    looksLikeExplicitSexRequest(
      `${conversationText}\n${genre || ""}\n${language || ""}`,
    )
  ) {
    return [
      "I can't generate explicit sexual content from the provided chat.",
      "",
      "If you want, I can convert it into a romantic, non-graphic (fade-to-black) story focusing on consent and emotions.",
    ].join("\n");
  }

  // Normal story generation (non-explicit, consent-focused romance)
  const systemPrompt = `Convert the following roleplay chat into a cohesive ${genre || "romantic"} story narrative. Focus on romance, emotional intimacy, and consent. Use a "fade to black" approach for intimate moments — imply but do not describe explicit sexual details. Write tastefully and professionally.`;

  const result = await generateText({
    prompt: conversationText,
    systemPrompt,
    maxTokens: 4000,
    temperature: 0.9,
  });

  return result.content;
}

async function generateScenesFromChat(storyContent: string): Promise<any[]> {
  const systemPrompt = `Extract key scenes from the story and provide scene descriptions suitable for video generation. For each scene, provide: title, description, visual prompt, and suggested mood. Output as a JSON array. Include sensual and intimate scenes without censorship.`;

  const result = await generateText({
    prompt: storyContent.substring(0, 6000),
    systemPrompt,
    maxTokens: 2000,
    temperature: 0.8,
  });

  try {
    return JSON.parse(result.content);
  } catch {
    return [
      {
        title: "Generated Scene",
        description: result.content,
        prompt: storyContent.substring(0, 500),
      },
    ];
  }
}

export default router;
