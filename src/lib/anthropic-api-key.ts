import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function parseVarsFile(filePath: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!existsSync(filePath)) return out;
  const text = readFileSync(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

/** Server-only: resolve Anthropic key from process.env, .dev.vars, or .env */
export function getAnthropicApiKey(): string | undefined {
  const fromProcess = process.env.ANTHROPIC_API_KEY?.trim();
  if (fromProcess) return fromProcess;

  try {
    const root = process.cwd();
    for (const file of [".dev.vars", ".env"]) {
      const vars = parseVarsFile(join(root, file));
      const key = vars.ANTHROPIC_API_KEY?.trim();
      if (key) return key;
    }
  } catch {
    // No filesystem in edge worker — rely on Cloudflare secrets / process.env
  }

  return undefined;
}
