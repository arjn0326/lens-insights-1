import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  GripHorizontal,
  MessageSquarePlus,
  MessagesSquare,
  Send,
  Sparkles,
} from "lucide-react";
import {
  DEMO_RICHLAND_QUESTION,
  getSuggestedQuestions,
} from "@/lib/lens-assistant-context";
import {
  filterParishesForAutocomplete,
  getAllParishes,
  parseParishMention,
  type ParishRef,
} from "@/lib/parish-resolve";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface HistoryEntry {
  role: "user" | "assistant";
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  history: HistoryEntry[];
  focusParish: string | null;
  updatedAt: number;
}

const STORAGE_KEY = "lens-ai-chats-v2";
const POSITION_KEY = "lens-ai-panel-position";
const SUGGESTIONS_KEY = "lens-ai-suggestions-expanded";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function defaultPanelPosition(width: number, height: number) {
  if (typeof window === "undefined") return { x: 24, y: 24 };
  return {
    x: Math.max(16, window.innerWidth - width - 24),
    y: Math.max(16, window.innerHeight - height - 96),
  };
}

function loadPanelPosition(width: number, height: number) {
  try {
    const raw = localStorage.getItem(POSITION_KEY);
    if (!raw) return defaultPanelPosition(width, height);
    const { x, y } = JSON.parse(raw) as { x: number; y: number };
    if (typeof x !== "number" || typeof y !== "number") return defaultPanelPosition(width, height);
    return {
      x: clamp(x, 8, window.innerWidth - width - 8),
      y: clamp(y, 8, window.innerHeight - height - 8),
    };
  } catch {
    return defaultPanelPosition(width, height);
  }
}

function loadSuggestionsExpanded() {
  try {
    const v = localStorage.getItem(SUGGESTIONS_KEY);
    if (v === "false") return false;
    return true;
  } catch {
    return true;
  }
}

const WELCOME: Message = {
  role: "assistant",
  content:
    "Hi — I'm LENS AI. Ask anything about Louisiana's 64 parishes using real LDOE, ACS, and BLS data.\n\nUse @ before a parish name to focus your question (e.g. @Richland or @Orleans). I'll combine the metrics and cite key numbers when they matter.",
  timestamp: new Date(),
};

function newChat(): ChatSession {
  return {
    id: crypto.randomUUID(),
    title: "New chat",
    messages: [{ ...WELCOME, timestamp: new Date() }],
    history: [],
    focusParish: null,
    updatedAt: Date.now(),
  };
}

function loadChats(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [newChat()];
    const parsed = JSON.parse(raw) as ChatSession[];
    return parsed.map((c) => ({
      ...c,
      messages: c.messages.map((m) => ({ ...m, timestamp: new Date(m.timestamp) })),
    }));
  } catch {
    return [newChat()];
  }
}

function saveChats(chats: ChatSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function MessageBody({ content }: { content: string }) {
  const blocks = content.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);

  const renderLine = (line: string, key: string | number) => {
    if (line.startsWith("📊")) {
      return (
        <div
          key={key}
          className="rounded-md border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 font-mono text-[11px] font-semibold text-[var(--foreground)]"
        >
          {line}
        </div>
      );
    }
    if (line.startsWith("**Decision signal:**") || line.startsWith("Decision signal:")) {
      return (
        <p key={key} className="text-[12px] font-semibold text-[var(--ink)]">
          {line.replace(/\*\*/g, "")}
        </p>
      );
    }
    const chunks = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={key}>
        {chunks.map((chunk, j) =>
          chunk.startsWith("**") && chunk.endsWith("**") ? (
            <strong key={j}>{chunk.slice(2, -2)}</strong>
          ) : (
            <span key={j}>{chunk}</span>
          ),
        )}
      </p>
    );
  };

  return (
    <div className="space-y-2 text-[13px] leading-snug">
      {blocks.map((block, i) => {
        const lines = block.split("\n").filter(Boolean);
        if (lines.length === 1) return renderLine(lines[0], i);
        return (
          <div key={i} className="space-y-1">
            {lines.map((line, j) => renderLine(line, `${i}-${j}`))}
          </div>
        );
      })}
    </div>
  );
}

function TrafficLights({
  onClose,
  onMinimize,
  onMaximize,
  maximized,
}: {
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  maximized: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="h-3 w-3 rounded-full bg-[#ff5f57] transition-opacity hover:opacity-80"
      />
      <button
        type="button"
        aria-label="Minimize"
        onClick={onMinimize}
        className="h-3 w-3 rounded-full bg-[#febc2e] transition-opacity hover:opacity-80"
      />
      <button
        type="button"
        aria-label={maximized ? "Restore" : "Maximize"}
        onClick={onMaximize}
        className="h-3 w-3 rounded-full bg-[#28c840] transition-opacity hover:opacity-80"
      />
    </div>
  );
}

export function LensAssistant() {
  const [panel, setPanel] = useState<"closed" | "open" | "minimized">("closed");
  const [maximized, setMaximized] = useState(false);
  const [showChatList, setShowChatList] = useState(false);
  const [chats, setChats] = useState<ChatSession[]>(() => loadChats());
  const [activeId, setActiveId] = useState(() => loadChats()[0]?.id ?? "");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionIndex, setMentionIndex] = useState(0);
  const [suggestionsExpanded, setSuggestionsExpanded] = useState(loadSuggestionsExpanded);
  const [dragging, setDragging] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const panelW = maximized ? 680 : 440;
  const panelH = maximized ? 720 : 580;

  const [position, setPosition] = useState(() => loadPanelPosition(440, 580));

  const activeChat = chats.find((c) => c.id === activeId) ?? chats[0];

  const focusSlug = useMemo(() => {
    const fromInput = parseParishMention(input).parish?.slug;
    if (fromInput) return fromInput;
    return activeChat?.focusParish ?? null;
  }, [input, activeChat?.focusParish]);

  const suggestions = useMemo(() => getSuggestedQuestions(focusSlug), [focusSlug]);

  const displaySuggestions = useMemo(() => {
    const base =
      focusSlug === "richland"
        ? [DEMO_RICHLAND_QUESTION, ...suggestions.filter((q) => q !== DEMO_RICHLAND_QUESTION)]
        : suggestions;
    return base.slice(0, 4);
  }, [focusSlug, suggestions]);

  const mentionOptions = useMemo(
    () => filterParishesForAutocomplete(mentionQuery),
    [mentionQuery],
  );

  useEffect(() => {
    saveChats(chats);
  }, [chats]);

  useEffect(() => {
    if (panel === "open") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [panel, activeChat?.messages, loading]);

  useEffect(() => {
    localStorage.setItem(SUGGESTIONS_KEY, String(suggestionsExpanded));
  }, [suggestionsExpanded]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      setPosition({
        x: clamp(e.clientX - dragOffsetRef.current.x, 8, window.innerWidth - panelW - 8),
        y: clamp(e.clientY - dragOffsetRef.current.y, 8, window.innerHeight - panelH - 8),
      });
    };
    const onUp = () => {
      setDragging(false);
      setPosition((pos) => {
        localStorage.setItem(POSITION_KEY, JSON.stringify(pos));
        return pos;
      });
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, panelW, panelH]);

  useEffect(() => {
    const onResize = () => {
      setPosition((pos) => ({
        x: clamp(pos.x, 8, window.innerWidth - panelW - 8),
        y: clamp(pos.y, 8, window.innerHeight - panelH - 8),
      }));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [panelW, panelH]);

  const startDrag = (e: React.MouseEvent) => {
    if (maximized) return;
    if ((e.target as HTMLElement).closest("button")) return;
    e.preventDefault();
    dragOffsetRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    setDragging(true);
  };

  const updateChat = useCallback((id: string, patch: Partial<ChatSession>) => {
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: Date.now() } : c)),
    );
  }, []);

  const handleInputChange = (value: string) => {
    setInput(value);
    const at = value.lastIndexOf("@");
    if (at >= 0 && !value.slice(at).includes(" ")) {
      setMentionOpen(true);
      setMentionQuery(value.slice(at + 1));
      setMentionIndex(0);
    } else {
      setMentionOpen(false);
      setMentionQuery("");
    }
  };

  const insertMention = (parish: ParishRef) => {
    const at = input.lastIndexOf("@");
    const before = at >= 0 ? input.slice(0, at) : input;
    setInput(`${before}@${parish.name} `);
    setMentionOpen(false);
    updateChat(activeId, { focusParish: parish.slug });
    inputRef.current?.focus();
  };

  async function sendMessage(textOverride?: string) {
    const text = (textOverride ?? input).trim();
    if (!text || loading || !activeChat) return;

    const mention = parseParishMention(text);
    const focus = mention.parish?.slug ?? activeChat.focusParish;

    let userContent = text;
    if (mention.parish && mention.corrected && mention.queryUsed) {
      userContent = `${text}\n(note: interpreted @${mention.queryUsed} as ${mention.parish.name})`;
    }

    const newHistory: HistoryEntry[] = [
      ...activeChat.history,
      { role: "user", content: userContent },
    ];

    const userMsg: Message = { role: "user", content: text, timestamp: new Date() };
    const title =
      activeChat.title === "New chat" ? text.slice(0, 42) + (text.length > 42 ? "…" : "") : activeChat.title;

    updateChat(activeId, {
      title,
      focusParish: focus ?? null,
      history: newHistory,
      messages: [...activeChat.messages, userMsg],
    });
    setInput("");
    setMentionOpen(false);
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newHistory, focusParish: focus }),
      });

      let data: { text?: string; error?: string } = {};
      try {
        data = (await res.json()) as { text?: string; error?: string };
      } catch {
        throw new Error(
          res.ok
            ? "Invalid response from server"
            : `Server error (${res.status}). Restart bun dev after adding .dev.vars.`,
        );
      }

      if (!res.ok || !data.text) {
        throw new Error(data.error ?? `Request failed (${res.status})`);
      }

      const reply = data.text;
      const assistantMsg: Message = {
        role: "assistant",
        content: reply,
        timestamp: new Date(),
      };

      setChats((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? {
                ...c,
                history: [...newHistory, { role: "assistant", content: reply }],
                messages: [...c.messages, userMsg, assistantMsg],
                updatedAt: Date.now(),
              }
            : c,
        ),
      );
    } catch (err) {
      const detail = err instanceof Error ? err.message : "";
      const msg = detail.includes("ANTHROPIC") || detail.includes("API key")
        ? `${detail} Restart \`bun dev\` after saving .dev.vars. For production: \`npx wrangler secret put ANTHROPIC_API_KEY\`.`
        : detail
          ? detail
          : "I couldn't reach LENS AI. Check your connection and API key, then try again.";

      setChats((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  userMsg,
                  { role: "assistant", content: msg, timestamp: new Date() },
                ],
                updatedAt: Date.now(),
              }
            : c,
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  const startNewChat = () => {
    const chat = newChat();
    setChats((prev) => [chat, ...prev]);
    setActiveId(chat.id);
    setInput("");
  };

  return (
    <>
      {panel === "closed" && (
        <button
          type="button"
          onClick={() => setPanel("open")}
          aria-label="Open LENS AI Assistant"
          className="fixed bottom-6 right-6 z-[9999] h-[60px] w-[60px] overflow-hidden rounded-full shadow-elevated ring-2 ring-[#c4a574]/40 transition-transform hover:scale-105"
        >
          <img src="/images/lens-ai-logo.png" alt="LENS AI" className="h-full w-full object-cover" />
        </button>
      )}

      {panel === "minimized" && (
        <button
          type="button"
          onClick={() => setPanel("open")}
          className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2 rounded-full border border-border bg-[var(--surface-elevated)] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--foreground)] shadow-elevated"
        >
          <Sparkles className="h-3.5 w-3.5 text-[#c4a574]" />
          LENS AI
        </button>
      )}

      {panel === "open" && (
        <div
          className={`fixed z-[9998] flex flex-col overflow-hidden rounded-xl border border-border bg-[var(--surface-elevated)] shadow-elevated ${
            dragging ? "select-none" : ""
          }`}
          style={
            maximized
              ? {
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  width: panelW,
                  height: panelH,
                }
              : {
                  left: position.x,
                  top: position.y,
                  width: panelW,
                  height: panelH,
                }
          }
        >
          {/* Title bar — drag handle */}
          <div
            role="presentation"
            onMouseDown={startDrag}
            className={`flex shrink-0 items-center gap-3 border-b border-border bg-[var(--ink)] px-4 py-3 text-[var(--primary-foreground)] ${
              maximized ? "" : "cursor-grab active:cursor-grabbing"
            }`}
          >
            <TrafficLights
              maximized={maximized}
              onClose={() => setPanel("closed")}
              onMinimize={() => setPanel("minimized")}
              onMaximize={() => setMaximized((m) => !m)}
            />
            {!maximized && (
              <GripHorizontal className="h-4 w-4 shrink-0 opacity-40" aria-hidden />
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-bold tracking-tight">LENS AI</div>
              <div className="truncate text-[10px] opacity-75">
                Louisiana parish education intelligence
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowChatList((v) => !v)}
              className={`rounded-md p-1.5 transition-colors ${showChatList ? "bg-white/15" : "hover:bg-white/10"}`}
              title="Chats"
            >
              <MessagesSquare className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={startNewChat}
              className="rounded-md p-1.5 hover:bg-white/10"
              title="New chat"
            >
              <MessageSquarePlus className="h-4 w-4" />
            </button>
          </div>

          <div className="flex min-h-0 flex-1">
            {showChatList && (
              <div className="scrollbar-thin w-[140px] shrink-0 overflow-y-auto border-r border-border bg-[var(--background)] p-2">
                {chats.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveId(c.id)}
                    className={`mb-1 w-full rounded-md px-2 py-2 text-left text-[11px] leading-snug transition-colors ${
                      c.id === activeId
                        ? "bg-[var(--ink)] text-[var(--primary-foreground)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--surface)]"
                    }`}
                  >
                    <div className="truncate font-semibold">{c.title}</div>
                    <div className="mt-0.5 truncate text-[9px] opacity-70">
                      {new Date(c.updatedAt).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto p-4">
                {activeChat?.messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                        LENS AI · {fmtTime(msg.timestamp)}
                      </span>
                    )}
                    <div
                      className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 ${
                        msg.role === "user"
                          ? "rounded-br-md bg-[var(--ink)] text-[var(--primary-foreground)]"
                          : "rounded-bl-md border border-border bg-[var(--surface)] text-[var(--foreground)]"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <MessageBody content={msg.content} />
                      ) : (
                        <p className="whitespace-pre-wrap text-[13px] leading-relaxed">{msg.content}</p>
                      )}
                    </div>
                    {msg.role === "user" && (
                      <span className="text-[9px] text-[var(--text-muted)]">{fmtTime(msg.timestamp)}</span>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                      LENS AI
                    </span>
                    <div className="flex gap-1 rounded-2xl rounded-bl-md border border-border bg-[var(--surface)] px-3 py-2">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--ink)]"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input + suggestions */}
              <div className="relative shrink-0 border-t border-border p-3">
                {displaySuggestions.length > 0 && (
                  <div className="mb-2.5">
                    <button
                      type="button"
                      onClick={() => setSuggestionsExpanded((v) => !v)}
                      className="flex w-full items-center justify-between gap-2 rounded-md py-0.5 text-left transition-colors hover:text-[var(--foreground)]"
                      aria-expanded={suggestionsExpanded}
                      aria-controls="lens-ai-suggestions"
                    >
                      <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                        Suggested questions
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform duration-200 ${
                          suggestionsExpanded ? "rotate-180" : ""
                        }`}
                        aria-hidden
                      />
                    </button>
                    {suggestionsExpanded && (
                      <div id="lens-ai-suggestions" className="mt-1.5 grid grid-cols-2 gap-1.5">
                        {displaySuggestions.map((q) => (
                          <button
                            key={q}
                            type="button"
                            title={q}
                            disabled={loading}
                            onClick={() => {
                              setInput(q);
                              if (focusSlug) updateChat(activeId, { focusParish: focusSlug });
                            }}
                            className="flex min-h-[52px] items-center rounded-lg border border-border bg-[var(--surface-elevated)] px-2.5 py-2 text-left text-[10px] leading-snug text-[var(--text-secondary)] transition-colors hover:border-[var(--ink)]/30 hover:text-[var(--foreground)] disabled:opacity-50"
                          >
                            <span className="line-clamp-3">{q}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {mentionOpen && mentionOptions.length > 0 && (
                  <div className="absolute bottom-full left-3 right-3 mb-1 max-h-40 overflow-y-auto rounded-lg border border-border bg-[var(--surface-elevated)] py-1 shadow-elevated">
                    {mentionOptions.map((p, i) => (
                      <button
                        key={p.slug}
                        type="button"
                        onClick={() => insertMention(p)}
                        className={`block w-full px-3 py-1.5 text-left text-[12px] ${
                          i === mentionIndex ? "bg-[var(--accent)]" : "hover:bg-[var(--surface)]"
                        }`}
                      >
                        <span className="font-semibold">{p.name}</span>
                        <span className="ml-1 text-[var(--text-muted)]">Parish</span>
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    rows={2}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (mentionOpen && e.key === "ArrowDown") {
                        e.preventDefault();
                        setMentionIndex((i) => Math.min(i + 1, mentionOptions.length - 1));
                        return;
                      }
                      if (mentionOpen && e.key === "ArrowUp") {
                        e.preventDefault();
                        setMentionIndex((i) => Math.max(i - 1, 0));
                        return;
                      }
                      if (mentionOpen && e.key === "Enter" && mentionOptions[mentionIndex]) {
                        e.preventDefault();
                        insertMention(mentionOptions[mentionIndex]);
                        return;
                      }
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Ask anything… use @ParishName to focus"
                    className="scrollbar-thin min-h-[44px] flex-1 resize-none rounded-lg border border-border bg-[var(--surface)] px-3 py-2 text-[13px] text-[var(--foreground)] outline-none ring-0 focus:border-[var(--ink)]/40"
                  />
                  <button
                    type="button"
                    onClick={() => sendMessage()}
                    disabled={loading || !input.trim()}
                    className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-lg bg-[var(--ink)] text-[var(--primary-foreground)] transition-opacity disabled:opacity-40"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
