const REQUIRED_ENV = [
  'DEEPGRAM_API_KEY',
  'GEMINI_API_KEY',
  'ELEVENLABS_API_KEY',
] as const;

/** Fails fast at boot if required env vars are missing or malformed. */
export function validateEnv(
  env: Record<string, unknown>,
): Record<string, unknown> {
  const missing = REQUIRED_ENV.filter(
    (key) => typeof env[key] !== 'string' || !env[key].trim(),
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`,
    );
  }
  const port = env.PORT;
  if (port !== undefined && !(typeof port === 'string' && /^\d+$/.test(port))) {
    throw new Error(`PORT must be a number, got ${JSON.stringify(port)}`);
  }
  return env;
}

/** Typed application config. Read it with `ConfigService<AppConfig, true>` and `{ infer: true }`. */
const configuration = () => ({
  port: parseInt(process.env.PORT ?? '3001', 10),
  deepgram: {
    apiKey: process.env.DEEPGRAM_API_KEY ?? '',
    model: process.env.DEEPGRAM_MODEL ?? 'nova-3',
    language: process.env.DEEPGRAM_LANGUAGE ?? 'en-US',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY ?? '',
    model: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',
  },
  elevenLabs: {
    apiKey: process.env.ELEVENLABS_API_KEY ?? '',
    // Voice IDs are stable; voice names depend on what's in the account. Default: "Sarah" (premade).
    voiceId: process.env.ELEVENLABS_VOICE_ID ?? 'EXAVITQu4vr4xnSDxMaL',
    modelId: process.env.ELEVENLABS_MODEL_ID ?? 'eleven_turbo_v2_5', // low-latency model
  },
});

export type AppConfig = ReturnType<typeof configuration>;
export default configuration;
