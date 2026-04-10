export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { logServerEnvOnStartup } = await import("@/lib/env/runtime-check");
    logServerEnvOnStartup();
  }
}
