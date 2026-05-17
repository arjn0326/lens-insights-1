import { createFileRoute } from "@tanstack/react-router";
import { getAnthropicApiKey } from "@/lib/anthropic-api-key";
import { buildSystemPrompt } from "@/lib/lens-assistant-context";

export const Route = createFileRoute("/api/assistant")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = getAnthropicApiKey();
        if (!apiKey) {
          return Response.json(
            {
              error:
                "ANTHROPIC_API_KEY not configured. Add it to .dev.vars (local) or run: npx wrangler secret put ANTHROPIC_API_KEY",
            },
            { status: 503 },
          );
        }

        let body: {
          messages?: { role: "user" | "assistant"; content: string }[];
          focusParish?: string | null;
        };
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const messages = body.messages ?? [];
        if (!messages.length) {
          return Response.json({ error: "No messages" }, { status: 400 });
        }

        try {
          const res = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": apiKey,
              "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
              model: "claude-sonnet-4-6",
              max_tokens: 700,
              system: buildSystemPrompt(body.focusParish ?? null),
              messages,
            }),
          });

          const raw = await res.text();
          let data: {
            content?: { text: string }[];
            error?: { message?: string; type?: string };
          } = {};
          try {
            data = raw ? JSON.parse(raw) : {};
          } catch {
            return Response.json(
              { error: "Invalid response from Anthropic API" },
              { status: 502 },
            );
          }

          if (!res.ok) {
            const msg =
              data.error?.message ??
              (raw.length < 200 ? raw : `Anthropic API error (${res.status})`);
            return Response.json({ error: msg }, { status: res.status });
          }

          const text = data.content?.[0]?.text ?? "";
          if (!text) {
            return Response.json({ error: "Empty response from Anthropic API" }, { status: 502 });
          }
          return Response.json({ text });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Unknown error";
          return Response.json(
            { error: `Failed to reach Anthropic API: ${msg}` },
            { status: 502 },
          );
        }
      },
    },
  },
});
