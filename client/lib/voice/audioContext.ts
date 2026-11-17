let ctx: AudioContext | null = null;

/**
 * One shared AudioContext for the whole app (browsers limit how many you can open).
 * Create or resume it from a user gesture (the mic click), or it starts suspended.
 */
export function getAudioContext(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}
