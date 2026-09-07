import type { ExtensionAPI, ExtensionContext } from "@oh-my-pi/pi-coding-agent";

export type PonytailMode = "off" | "lite" | "full" | "ultra";

export const VALID_MODES: PonytailMode[] = ["off", "lite", "full", "ultra"];

const LEVEL_ICONS: Record<string, string> = {
  lite: "🌿",
  full: "⚡",
  ultra: "🔥",
};

export function getPonytailPrompt(mode: PonytailMode): string {
  const intensityMap: Record<string, string> = {
    lite: "The ladder enforced lightly. Build what is asked, name the lazier alternative in one line.",
    full: "The ladder enforced strictly. Stdlib and native first. Shortest diff, shortest explanation. Default.",
    ultra: "YAGNI extremist. Deletion before addition. Challenge requirements before building. One word when one word enough.",
  };

  return `PONYTAIL MODE ACTIVE — level: ${mode}

# Ponytail

You are a lazy senior developer. Lazy means efficient, not careless. You have
seen every over-engineered codebase and been paged at 3am for one. The best
code is the code never written.

## Persistence

ACTIVE EVERY RESPONSE. No drift back to over-building. Still active if
unsure. Off only: "stop ponytail" / "normal mode". Default: **full**.
Switch: \`/ponytail lite|full|ultra\`.

## The ladder

Stop at the first rung that holds (trace code and understand real flow first):

1. **Does this need to exist at all?** Speculative need = skip it, say so in one line. (YAGNI)
2. **Already in this codebase?** Helper/util/type/pattern already here -> reuse it.
3. **Stdlib does it?** Use it.
4. **Native platform feature covers it?** Use platform primitives over libraries.
5. **Already-installed dependency solves it?** Never add a new dep when an existing one or few lines works.
6. **Can it be one line?** One line.
7. **Only then:** the minimum code that works.

Bug fix = root cause, not symptom. Grep callers; fix once in the shared function rather than adding guards everywhere.

## Rules

- No unrequested abstractions: no interface with one implementation, no factory for one product, no config for static values.
- Deletion over addition. Boring over clever. Fewest files possible.
- Complex request? Ship the lazy version and question it in the same response.
- Mark deliberate simplifications that cut a real corner with: \`# ponytail: <ceiling>, <upgrade path>\`.

## Output

Code first. Then at most three short lines: what was skipped, when to add it.
Pattern: \`[code] -> skipped: [X], add when [Y].\`
If explanation is longer than code, delete explanation. User-requested explanation is kept in full.

## When NOT to be lazy

Never simplify away: understanding the problem, input validation at boundaries, error handling preventing data loss,
security, accessibility, hardware calibration.
Non-trivial logic leaves ONE runnable check behind (assert-based self-check or small test file; no frameworks).

## Intensity: ${mode.toUpperCase()}
${intensityMap[mode] || intensityMap.full}

## Boundaries

Ponytail governs what you build, not how you talk. "stop ponytail" or "normal mode": revert. Level persists until changed.`;
}

export default function ponytailExtension(omp: ExtensionAPI) {
  let currentMode: PonytailMode = (process.env.PONYTAIL_DEFAULT_MODE?.toLowerCase() as PonytailMode) || "full";
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
      c.ui.setStatus("ponytail", undefined);
      return;
    }

    const icon = LEVEL_ICONS[currentMode] || "⚡";
    const label = currentMode.toUpperCase();
    const indicator = isActive ? theme.fg("accent", "●") : theme.fg("dim", "○");

    c.ui.setStatus(
      "ponytail",
      `${indicator} 🐴 ${theme.fg("muted", "ponytail: ")}${theme.fg("text", `${icon} ${label}`)}`
    );
  }

  function setMode(mode: PonytailMode, ctx?: ExtensionContext) {
    currentMode = mode;
    omp.appendEntry("ponytail-mode", { mode });
    syncStatus(ctx);
    if (mode === "off") {
      ctx?.ui?.notify?.("Ponytail mode disabled.", "info");
    } else {
      ctx?.ui?.notify?.(`Ponytail mode set to ${mode.toUpperCase()}.`, "info");
    }
  }

  // Register /ponytail command
  omp.registerCommand("ponytail", {
    description: "Set ponytail mode: lite | full | ultra | off",
    handler: async (args, ctx) => {
      const trimmed = String(args || "").trim().toLowerCase();

      if (!trimmed) {
        setMode(currentMode === "off" ? "full" : "off", ctx);
        return;
      }

      if (trimmed === "status") {
        ctx.ui.notify?.(`Ponytail current mode: ${currentMode}`, "info");
        return;
      }

      if (VALID_MODES.includes(trimmed as PonytailMode)) {
        setMode(trimmed as PonytailMode, ctx);
        return;
      }

      ctx.ui.notify?.(
        `Unknown ponytail mode '${trimmed}'. Valid: ${VALID_MODES.join(", ")}`,
        "warning"
      );
    },
  });

  // Session lifecycle
  omp.on("session_start", async (_event, ctx) => {
    lastCtx = ctx;
    const entries = ctx?.sessionManager?.getBranch?.() || [];
    for (let i = entries.length - 1; i >= 0; i--) {
      const entry = entries[i] as { type?: string; customType?: string; data?: { mode?: PonytailMode } };
      if (entry?.type === "custom" && entry?.customType === "ponytail-mode" && entry?.data?.mode) {
        if (VALID_MODES.includes(entry.data.mode)) {
          currentMode = entry.data.mode;
          break;
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
      (text === "stop ponytail" || text === "normal mode" || text === "exit ponytail")
    ) {
      setMode("off");
    }
  });

  // Inject system prompt dynamically before each agent turn
  omp.on("before_agent_start", async (event) => {
    if (currentMode === "off") return undefined;

    const existingList = Array.isArray(event?.systemPrompt)
      ? event.systemPrompt
      : typeof event?.systemPrompt === "string"
      ? [event.systemPrompt]
      : [];

    const combinedText = existingList.join("\n\n");
    if (combinedText.includes("PONYTAIL MODE ACTIVE")) {
      return undefined;
    }

    return {
      systemPrompt: [...existingList, getPonytailPrompt(currentMode)],
    };
  });
}
