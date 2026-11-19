/** Formats an unknown thrown value for the second (stack) argument of `Logger.error`. */
export function errorStack(error: unknown): string {
  return error instanceof Error
    ? (error.stack ?? error.message)
    : String(error);
}
