export const SEGMENTS = [
  "no-ganar", "oro-1k", "oro-10k", "gemas-500", "gemas-1200", "pass",
];

export const PRIZE_LABELS: Record<string, string> = {
  "oro-1k": "Oro $1,000",
  "oro-10k": "Oro $10,000",
  "gemas-500": "Gemas 500",
  "gemas-1200": "Gemas 1200",
  "pass": "Pass Royale",
};

const FREE_WEIGHTS: Record<string, number> = {
  "oro-1k": 22, "oro-10k": 16, "gemas-500": 12, "gemas-1200": 7, "pass": 3, "no-ganar": 40,
};

const EVENT_WEIGHTS: Record<string, number> = {
  "oro-1k": 6, "oro-10k": 5, "gemas-500": 4, "gemas-1200": 2.5, "pass": 0.5, "no-ganar": 82,
};

export interface PrizeConfig {
  eventActive: boolean;
  prizeCounts: Record<string, number>;
  passAwarded: boolean;
}

const defaultConfig: PrizeConfig = {
  eventActive: false,
  prizeCounts: { "oro-1k": 0, "oro-10k": 0, "gemas-500": 0, "gemas-1200": 0, "pass": 0 },
  passAwarded: false,
};

export function pickPrize(config?: PrizeConfig | null): { prize: string; segmentIndex: number } {
  const cfg = config ?? defaultConfig;
  const weights = cfg.eventActive ? { ...EVENT_WEIGHTS } : { ...FREE_WEIGHTS };

  if (cfg.eventActive) {
    if (cfg.prizeCounts["oro-1k"] >= 3) delete weights["oro-1k"];
    if (cfg.prizeCounts["oro-10k"] >= 3) delete weights["oro-10k"];
    if (cfg.prizeCounts["gemas-500"] >= 3) delete weights["gemas-500"];
    if (cfg.prizeCounts["gemas-1200"] >= 3) delete weights["gemas-1200"];
    if (cfg.passAwarded) delete weights["pass"];
  }

  const segments: { prize: string; weight: number }[] = [];
  for (const seg of SEGMENTS) {
    if (seg === "no-ganar" || weights[seg] !== undefined) {
      segments.push({ prize: seg, weight: seg === "no-ganar" ? weights["no-ganar"] : weights[seg] });
    } else {
      segments.push({ prize: "no-ganar", weight: weights["no-ganar"] });
    }
  }

  const total = segments.reduce((acc, seg) => acc + seg.weight, 0);
  const r = Math.random() * total;
  let acum = 0;
  for (let i = 0; i < segments.length; i++) {
    acum += segments[i].weight;
    if (r <= acum) return { prize: segments[i].prize, segmentIndex: i };
  }
  return { prize: "no-ganar", segmentIndex: 0 };
}

export function pickPrizeWithDefaults(eventActive: boolean): { prize: string; segmentIndex: number } {
  return pickPrize(eventActive ? defaultConfig : null);
}
