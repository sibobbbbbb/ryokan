import type { LLMThesisResponse } from '@/types/ryokan';

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

export const RYOKAN_SYSTEM_PROMPT = `You are Ryokan Tetsu (凌寒 鉄), a strict AI risk management analyst for cryptocurrency futures trading.

ROLE:
Your job is NOT to predict market direction.
Your job is to evaluate whether the trader has a structurally sound thesis backed by real market conditions. You stress-test ideas.
You are allowed — and expected — to tell traders their idea is poor.

EVALUATION CRITERIA:
1. EMA alignment: Is entry in the direction indicated by EMA 21/50/200 stack?
2. Structural basis: Is there a legitimate S/R zone near the entry?
3. Thesis coherence: Does the stated thesis match observable conditions?
4. Invalidation logic: Does the trader understand what would prove them wrong?

SCORING (thesisScore 1-10):
8-10: Strong thesis, aligned with EMA structure, clear invalidation
5-7: Adequate thesis with some structural support, proceed cautiously
3-4: Weak thesis, misaligned or unsupported — flag clearly
1-2: Thesis contradicts market structure — reject

PERSONALITY:
- Direct and concise. No encouragement. No padding.
- Analytical, not emotional.
- Short sentences. State what is, not what might be.
- When rejecting: be specific about WHY, not just that you're rejecting.

CRITICAL: Return ONLY valid JSON. No markdown. No preamble. No \`\`\`json fences.

OUTPUT FORMAT:
{
  "thesisScore": number,
  "entryGrade": "A" | "B" | "C" | "D",
  "alignmentSummary": "string",
  "structuralValidity": "string",
  "riskFlag": "none" | "caution" | "reject",
  "ryokanStatement": "string",
  "whatWouldChangeAssessment": "string"
}`;

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class OpenRouterError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'OpenRouterError';
  }
}

export async function callOpenRouter(
  messages: OpenRouterMessage[]
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL ?? 'deepseek/deepseek-r1';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ryokan.vercel.app';

  if (!apiKey) {
    throw new OpenRouterError('OPENROUTER_API_KEY is not set', 500);
  }

  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': appUrl,
      'X-Title': 'RYOKAN Risk Accountability System',
    },
    body: JSON.stringify({
      model,
      messages,
      response_format: { type: 'json_object' },
    }),
  });

  if (res.status === 401) {
    throw new OpenRouterError('Invalid OpenRouter API key', 401);
  }
  if (res.status === 429) {
    throw new OpenRouterError('OpenRouter rate limit exceeded', 429);
  }
  if (!res.ok) {
    throw new OpenRouterError(`OpenRouter API error: ${res.status}`, res.status);
  }

  const data = (await res.json()) as OpenRouterResponse;
  return data.choices[0]?.message?.content ?? '';
}

export function parseLLMThesisResponse(raw: string): LLMThesisResponse {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('LLM returned non-JSON response');
  }

  const obj = parsed as Record<string, unknown>;

  // Validate all required fields are present
  const required: Array<keyof LLMThesisResponse> = [
    'thesisScore',
    'entryGrade',
    'alignmentSummary',
    'structuralValidity',
    'riskFlag',
    'ryokanStatement',
    'whatWouldChangeAssessment',
  ];

  for (const field of required) {
    if (obj[field] === undefined || obj[field] === null) {
      throw new Error(`LLM response missing field: ${field}`);
    }
  }

  return {
    thesisScore: Number(obj.thesisScore),
    entryGrade: String(obj.entryGrade),
    alignmentSummary: String(obj.alignmentSummary),
    structuralValidity: String(obj.structuralValidity),
    riskFlag: String(obj.riskFlag),
    ryokanStatement: String(obj.ryokanStatement),
    whatWouldChangeAssessment: String(obj.whatWouldChangeAssessment),
  };
}
