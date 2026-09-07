import type { ExtensionAPI, ExtensionContext } from "@oh-my-pi/pi-coding-agent";

export type CavemanMode =
  | "off"
  | "lite"
  | "full"
  | "ultra"
  | "wenyan"
  | "wenyan-lite"
  | "wenyan-full"
  | "wenyan-ultra";

export const VALID_MODES: CavemanMode[] = [
  "off",
  "lite",
  "full",
  "ultra",
  "wenyan",
  "wenyan-lite",
  "wenyan-full",
  "wenyan-ultra",
];

const LEVEL_ICONS: Record<string, string> = {
  lite: "🌿",
  full: "⚡",
  ultra: "🔥",
  wenyan: "📜",
  "wenyan-lite": "📜",
  "wenyan-full": "📜",
  "wenyan-ultra": "📜",
};

export function getCavemanPrompt(mode: CavemanMode): string {
  return `Respond terse like smart caveman. All technical substance stay. Only fluff die.

## Active Level: ${mode.toUpperCase()}
- Drop: articles (a/an/the), filler, pleasantries, hedging. Fragments OK.
- Short synonyms, active voice, imperative instructions.
- Code blocks, command lines, error strings: NEVER modify or abbreviate.
- Preserve user's language: reply in user's language with caveman terseness.
${
  mode === "ultra"
    ? "- ULTRA: Extreme compression, bare fragments, no conjunctions when unambiguous."
    : mode === "lite"
    ? "- LITE: Keep articles and complete sentence structure, drop only fluff and pleasantries."
    : mode.startsWith("wenyan")
    ? "- WENYAN: Classical Chinese style terseness (文言文)."
    : "- FULL: Drop articles, fragments OK, shortest decisive wording."
}`;
}

export default function cavemanExtension(pi: ExtensionAPI) {
  let currentMode: CavemanMode = (process.env.CAVEMAN_DEFAULT_MODE?.toLowerCase() as CavemanMode) || "full";
  if (!VALID_MODES.includes(currentMode)) {
    currentMode = "full";
  }

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

    const icon = LEVEL_ICONS[currentMode] || "⚡";
    const label = currentMode.toUpperCase();
    const indicator = isActive ? theme.fg("accent", "●") : theme.fg("dim", "○");

    c.ui.setStatus(
      "caveman",
      `${indicator} 🦴 ${theme.fg("muted", "caveman: ")}${theme.fg("text", `${icon} ${label}`)}`
    );
  }

  function setMode(mode: CavemanMode, ctx?: ExtensionContext) {
    currentMode = mode;
    syncStatus(ctx);
    if (mode === "off") {
      ctx?.ui?.notify?.("Caveman mode disabled.", "info");
    } else {
      ctx?.ui?.notify?.(`Caveman mode: ${mode.toUpperCase()}`, "info");
    }
  }

  // Register /caveman command
  pi.registerCommand("caveman", {
    description: "Set caveman mode: lite | full | ultra | wenyan | off",
    handler: async (args, ctx) => {
      const trimmed = String(args || "").trim().toLowerCase();

      if (!trimmed) {
        setMode(currentMode === "off" ? "full" : "off", ctx);
        return;
      }

      if (trimmed === "status") {
        ctx.ui.notify?.(`Caveman current mode: ${currentMode}`, "info");
        return;
      }

      if (VALID_MODES.includes(trimmed as CavemanMode)) {
        setMode(trimmed as CavemanMode, ctx);
        return;
      }

      ctx.ui.notify?.(
        `Unknown caveman mode '${trimmed}'. Valid: ${VALID_MODES.join(", ")}`,
        "warning"
      );
    },
  });

  // Session lifecycle
  pi.on("session_start", async (_event, ctx) => {
    lastCtx = ctx;
    syncStatus(ctx);
  });

  pi.on("agent_start", async (_event, ctx) => {
    isActive = true;
    syncStatus(ctx);
  });

  pi.on("agent_end", async (_event, ctx) => {
    isActive = false;
    syncStatus(ctx);
  });

  // Natural language deactivation
  pi.on("input", async (event) => {
    if (event?.source === "extension") return;
    const text = String(event?.text || "").trim().toLowerCase();
    if (
      currentMode !== "off" &&
      (text === "stop caveman" || text === "normal mode" || text === "exit caveman")
    ) {
      setMode("off");
    }
  });

  // Inject system prompt when active
  pi.on("before_agent_start", async (event) => {
    if (currentMode === "off") return undefined;

    const existingList = Array.isArray(event?.systemPrompt)
      ? event.systemPrompt
      : typeof event?.systemPrompt === "string"
      ? [event.systemPrompt]
      : [];

    const combinedText = existingList.join("\n\n");
    if (combinedText.includes("Respond terse like smart caveman")) {
      return undefined;
    }

    return {
      systemPrompt: [...existingList, getCavemanPrompt(currentMode)],
    };
  });
}
