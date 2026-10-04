import type { ExtensionAPI, ExtensionContext } from "@oh-my-pi/pi-coding-agent";

export type CanonicalCavemanMode = "off" | "caveman" | "ultracave" | "megacave";

export function canonicalMode(raw?: string): CanonicalCavemanMode | null {
  if (!raw) return null;
  const trimmed = raw.trim().toLowerCase();
  if (trimmed === "off") return "off";
  if (trimmed === "caveman" || trimmed === "full" || trimmed === "lite") return "caveman";
  if (trimmed === "ultracave" || trimmed === "ultra") return "ultracave";
  if (trimmed === "megacave" || trimmed.startsWith("wenyan")) return "megacave";
  return null;
}

const MODE_ICONS: Record<CanonicalCavemanMode, string> = {
  off: "",
  caveman: "⚡",
  ultracave: "🔥",
  megacave: "📜",
};

export function getCavemanPrompt(mode: CanonicalCavemanMode): string {
  if (mode === "ultracave") {
    return `CAVEMAN MODE ACTIVE — mode: ultracave

Respond terse like smart caveman. Grammar stripped. Payload only. Then cut again.

## Rules
1. Bare fragments: one word when one word enough. State each fact once.
2. Never drop not/never/no/only/except. Numbers, units exact.
3. Code, commands, paths, API names, error strings: strictly verbatim.
4. Preserve user's language.

## Coordination with Ponytail
- Code generation: Defer to Ponytail delivery format (code first, max 3 lines what was skipped/when to add).
- Explanation: Ultracave compression strictly applies.`;
  }

  if (mode === "megacave") {
    return `CAVEMAN MODE ACTIVE — mode: megacave

以文言答。技術之實皆存，唯贅言去之。

## 規程
1. 文言體式：主語可省則省，動先於賓，虛詞代連詞（之/乃/為/其/則/故/以）。
2. 禁削實體：代碼、指令、路徑、API 名、報錯信息一律原文。否定詞（不/非/勿/未）與阿拉伯數字禁削。
3. 白話避歧：文言表意歧義處，退守白話。`;
  }

  return `CAVEMAN MODE ACTIVE — mode: caveman

Respond terse like smart caveman. All technical substance stay. Only fluff die.

## Rules
1. Answer first: [thing] [action] [reason]. [next step].
2. Kill ceremony: no greeting, hedging, pleasantries, recap, or closer.
3. Short word: active voice, imperative for instructions, standard acronyms fine.
4. Articles optional: drop a/an/the when sentence reads in one pass. Fragments fine.
5. Never drop not/never/no/only/except. Numbers and units exact.
6. Payload verbatim: code blocks, commands, paths, API names, errors unchanged.
7. User's language: preserve user's language, compress style only.
8. Never perform caveman: no fake broken grammar, no "me think", no emoji/decorations.

## Coordination with Ponytail
- Code generation: Defer to Ponytail delivery format (code first, max 3 lines what was skipped/when to add).
- Analysis and explanation: Caveman compression strictly applies ([thing] [action] [reason]. [next step].).`;
}

export default function cavemanExtension(omp: ExtensionAPI) {
  let currentMode: CanonicalCavemanMode = canonicalMode(process.env.CAVEMAN_DEFAULT_MODE) || "caveman";
  let isActive = false;
  let lastCtx: ExtensionContext | null = null;

  function syncStatus(ctx?: ExtensionContext) {
    if (ctx) lastCtx = ctx;
    const c = ctx || lastCtx;
    if (!c?.ui?.setStatus) return;

    let theme: { fg?: (color: string, text: string) => string } | undefined;
    try {
      theme = c.ui.theme as { fg?: (color: string, text: string) => string } | undefined;
      if (typeof theme?.fg !== "function") return;
    } catch {
      return;
    }

    if (currentMode === "off") {
      c.ui.setStatus("caveman", undefined);
      return;
    }

    const icon = MODE_ICONS[currentMode] || "⚡";
    const label = currentMode.toUpperCase();
    const indicator = isActive ? theme.fg("accent", "●") : theme.fg("dim", "○");

    c.ui.setStatus(
      "caveman",
      `${indicator} 🦴 ${theme.fg("muted", "caveman: ")}${theme.fg("text", `${icon} ${label}`)}`
    );
  }

  function setMode(mode: CanonicalCavemanMode, ctx?: ExtensionContext) {
    currentMode = mode;
    omp.appendEntry("caveman-mode", { mode });
    syncStatus(ctx);
    if (mode === "off") {
      ctx?.ui?.notify?.("Caveman mode disabled.", "info");
    } else {
      ctx?.ui?.notify?.(`Caveman mode: ${mode.toUpperCase()}`, "info");
    }
  }

  // Register /caveman command
  omp.registerCommand("caveman", {
    description: "Set caveman mode: caveman | ultracave | megacave | off | status",
    handler: async (args, ctx) => {
      const trimmed = String(args || "").trim().toLowerCase();

      if (!trimmed) {
        if (currentMode === "off") {
          setMode("caveman", ctx);
        } else {
          ctx.ui.notify?.(
            `Caveman active: ${currentMode}. Use /caveman off to disable.`,
            "info"
          );
        }
        return;
      }

      if (trimmed === "status") {
        ctx.ui.notify?.(`Caveman current mode: ${currentMode}`, "info");
        return;
      }

      const normalized = canonicalMode(trimmed);
      if (normalized) {
        setMode(normalized, ctx);
        return;
      }

      ctx.ui.notify?.(
        `Unknown caveman mode '${trimmed}'. Valid: caveman, ultracave, megacave, off`,
        "warning"
      );
    },
  });

  // Register /ultracave shortcut
  omp.registerCommand("ultracave", {
    description: "Switch to ultracave mode (grammar stripped, bare fragments)",
    handler: async (_args, ctx) => {
      setMode("ultracave", ctx);
    },
  });

  // Register /megacave shortcut
  omp.registerCommand("megacave", {
    description: "Switch to megacave mode (Classical Chinese 文言文)",
    handler: async (_args, ctx) => {
      setMode("megacave", ctx);
    },
  });

  // Session lifecycle: restore mode from session history
  omp.on("session_start", async (_event, ctx) => {
    lastCtx = ctx;
    const entries = ctx?.sessionManager?.getBranch?.() || [];
    for (let i = entries.length - 1; i >= 0; i--) {
      const entry = entries[i];
      if (entry && typeof entry === "object" && "type" in entry && "customType" in entry) {
        if (entry.type === "custom" && entry.customType === "caveman-mode" && "data" in entry) {
          const data = entry.data;
          if (data && typeof data === "object" && "mode" in data) {
            const restored = canonicalMode(String(data.mode));
            if (restored) {
              currentMode = restored;
              break;
            }
          }
        }
      }
    }
    syncStatus(ctx);
  });

  omp.on("agent_start", async (_event, ctx) => {
    isActive = true;
    syncStatus(ctx);
  });

  omp.on("agent_end", async (_event, ctx) => {
    isActive = false;
    syncStatus(ctx);
  });

  // Natural language deactivation
  omp.on("input", async (event) => {
    if (event?.source === "extension") return;
    const text = String(event?.text || "").trim().toLowerCase();
    if (
      currentMode !== "off" &&
      (text === "stop caveman" || text === "normal mode" || text === "exit caveman" || text === "caveman off")
    ) {
      setMode("off");
    }
  });

  // Inject system prompt dynamically before each agent turn
  omp.on("before_agent_start", async (event) => {
    const prompt = getCavemanPrompt(currentMode);
    let sections: Record<string, string> | null = null;
    if (event && typeof event === "object" && "systemPromptOptions" in event) {
      const options = event.systemPromptOptions;
      if (options && typeof options === "object" && "sections" in options) {
        const rawSections = options.sections;
        if (rawSections && typeof rawSections === "object") {
          sections = rawSections as Record<string, string>;
        }
      }
    }

    if (currentMode === "off") {
      if (sections) {
        delete sections.caveman;
      }
      return undefined;
    }

    if (sections) {
      sections.caveman = prompt;
      return undefined;
    }

    const existingList = Array.isArray(event?.systemPrompt)
      ? event.systemPrompt
      : typeof event?.systemPrompt === "string"
      ? [event.systemPrompt]
      : [];

    const combinedText = existingList.join("\n\n");
    if (combinedText.includes("CAVEMAN MODE ACTIVE")) {
      return undefined;
    }

    return {
      systemPrompt: [...existingList, prompt],
    };
  });
}
