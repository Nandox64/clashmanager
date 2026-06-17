export interface CardInfo {
  id: number;
  name: string;
  elixir: number;
  rarity: "common" | "rare" | "epic" | "legendary" | "champion";
  type: "troop" | "building" | "spell";
}

export const CARDS: CardInfo[] = [
  // ── Legendary ──
  { id: 26000000, name: "Miner", elixir: 3, rarity: "legendary", type: "troop" },
  { id: 26000001, name: "Princess", elixir: 3, rarity: "legendary", type: "troop" },
  { id: 26000002, name: "Ice Wizard", elixir: 3, rarity: "legendary", type: "troop" },
  { id: 26000003, name: "Lumberjack", elixir: 4, rarity: "legendary", type: "troop" },
  { id: 26000004, name: "Bandit", elixir: 3, rarity: "legendary", type: "troop" },
  { id: 26000005, name: "Magic Archer", elixir: 4, rarity: "legendary", type: "troop" },
  { id: 26000006, name: "Night Witch", elixir: 4, rarity: "legendary", type: "troop" },
  { id: 26000007, name: "Mother Witch", elixir: 3, rarity: "legendary", type: "troop" },
  { id: 26000008, name: "Royal Ghost", elixir: 3, rarity: "legendary", type: "troop" },
  { id: 26000009, name: "Sparky", elixir: 6, rarity: "legendary", type: "troop" },
  { id: 26000010, name: "Lava Hound", elixir: 7, rarity: "legendary", type: "troop" },
  { id: 26000011, name: "Mega Knight", elixir: 7, rarity: "legendary", type: "troop" },
  { id: 26000012, name: "Inferno Dragon", elixir: 4, rarity: "legendary", type: "troop" },
  { id: 26000013, name: "Electro Wizard", elixir: 4, rarity: "legendary", type: "troop" },
  { id: 26000014, name: "Ram Rider", elixir: 5, rarity: "legendary", type: "troop" },
  { id: 26000015, name: "Fisherman", elixir: 3, rarity: "legendary", type: "troop" },
  { id: 26000016, name: "Phoenix", elixir: 4, rarity: "legendary", type: "troop" },
  { id: 26000017, name: "Golden Knight", elixir: 4, rarity: "legendary", type: "troop" },
  { id: 26000018, name: "Skeleton King", elixir: 4, rarity: "legendary", type: "troop" },
  { id: 26000019, name: "Archer Queen", elixir: 5, rarity: "legendary", type: "troop" },

  // ── Champion ──
  { id: 26000060, name: "Mighty Miner", elixir: 4, rarity: "champion", type: "troop" },
  { id: 26000061, name: "Monk", elixir: 5, rarity: "champion", type: "troop" },
  { id: 26000062, name: "Little Prince", elixir: 3, rarity: "champion", type: "troop" },
  { id: 26000063, name: "Dagger Duchess", elixir: 3, rarity: "champion", type: "troop" },
  { id: 26000064, name: "Goblinstein", elixir: 5, rarity: "champion", type: "troop" },
  { id: 26000106, name: "Boss Bandit", elixir: 6, rarity: "champion", type: "troop" },

  // ── Epic ──
  { id: 26000020, name: "Balloon", elixir: 5, rarity: "epic", type: "troop" },
  { id: 26000021, name: "Golem", elixir: 8, rarity: "epic", type: "troop" },
  { id: 26000022, name: "Pekka", elixir: 7, rarity: "epic", type: "troop" },
  { id: 26000023, name: "Graveyard", elixir: 5, rarity: "epic", type: "spell" },
  { id: 26000024, name: "Freeze", elixir: 4, rarity: "epic", type: "spell" },
  { id: 26000025, name: "Tornado", elixir: 3, rarity: "epic", type: "spell" },
  { id: 26000026, name: "Poison", elixir: 4, rarity: "epic", type: "spell" },
  { id: 26000027, name: "Lightning", elixir: 6, rarity: "epic", type: "spell" },
  { id: 26000028, name: "Bowler", elixir: 5, rarity: "epic", type: "troop" },
  { id: 26000029, name: "Dark Prince", elixir: 4, rarity: "epic", type: "troop" },
  { id: 26000030, name: "Prince", elixir: 5, rarity: "epic", type: "troop" },
  { id: 26000031, name: "Baby Dragon", elixir: 4, rarity: "epic", type: "troop" },
  { id: 26000032, name: "Electro Dragon", elixir: 5, rarity: "epic", type: "troop" },
  { id: 26000033, name: "Executioner", elixir: 5, rarity: "epic", type: "troop" },
  { id: 26000034, name: "Goblin Barrel", elixir: 3, rarity: "epic", type: "spell" },
  { id: 26000035, name: "Goblin Drill", elixir: 4, rarity: "epic", type: "spell" },
  { id: 26000036, name: "Goblin Giant", elixir: 6, rarity: "epic", type: "troop" },
  { id: 26000037, name: "Wall Breakers", elixir: 2, rarity: "epic", type: "troop" },
  { id: 26000038, name: "Clone", elixir: 3, rarity: "epic", type: "spell" },
  { id: 26000039, name: "Rage", elixir: 2, rarity: "epic", type: "spell" },
  { id: 26000040, name: "Barbarian Barrel", elixir: 2, rarity: "epic", type: "spell" },
  { id: 26000041, name: "Guards", elixir: 3, rarity: "epic", type: "troop" },
  { id: 26000042, name: "Mirror", elixir: 2, rarity: "epic", type: "spell" },
  { id: 26000043, name: "Cannon Cart", elixir: 5, rarity: "epic", type: "troop" },
  { id: 26000044, name: "Hunter", elixir: 4, rarity: "epic", type: "troop" },
  { id: 26000046, name: "Skeleton Dragons", elixir: 4, rarity: "epic", type: "troop" },

  // ── Rare ──
  { id: 26000047, name: "Hog Rider", elixir: 4, rarity: "rare", type: "troop" },
  { id: 26000048, name: "Giant", elixir: 5, rarity: "rare", type: "troop" },
  { id: 26000049, name: "Royal Giant", elixir: 6, rarity: "rare", type: "troop" },
  { id: 26000050, name: "Valkyrie", elixir: 4, rarity: "rare", type: "troop" },
  { id: 26000051, name: "Musketeer", elixir: 4, rarity: "rare", type: "troop" },
  { id: 26000052, name: "Mini Pekka", elixir: 4, rarity: "rare", type: "troop" },
  { id: 26000053, name: "Fireball", elixir: 4, rarity: "rare", type: "spell" },
  { id: 26000054, name: "Rocket", elixir: 6, rarity: "rare", type: "spell" },
  { id: 26000055, name: "Elixir Collector", elixir: 6, rarity: "rare", type: "building" },
  { id: 26000056, name: "Furnace", elixir: 4, rarity: "rare", type: "building" },
  { id: 26000057, name: "Tombstone", elixir: 3, rarity: "rare", type: "building" },
  { id: 26000058, name: "Inferno Tower", elixir: 5, rarity: "rare", type: "building" },
  { id: 26000059, name: "Bomb Tower", elixir: 4, rarity: "rare", type: "building" },
  { id: 26000065, name: "Tesla", elixir: 4, rarity: "rare", type: "building" },
  { id: 26000066, name: "Battle Ram", elixir: 4, rarity: "rare", type: "troop" },
  { id: 26000067, name: "Battle Healer", elixir: 4, rarity: "rare", type: "troop" },
  { id: 26000068, name: "Three Musketeers", elixir: 9, rarity: "rare", type: "troop" },
  { id: 26000069, name: "Elixir Golem", elixir: 3, rarity: "rare", type: "troop" },
  { id: 26000070, name: "Ice Golem", elixir: 2, rarity: "rare", type: "troop" },
  { id: 26000071, name: "Mega Minion", elixir: 3, rarity: "rare", type: "troop" },
  { id: 26000072, name: "Dart Goblin", elixir: 3, rarity: "rare", type: "troop" },
  { id: 26000073, name: "Zappies", elixir: 4, rarity: "rare", type: "troop" },
  { id: 26000074, name: "Royal Hogs", elixir: 5, rarity: "rare", type: "troop" },
  { id: 26000075, name: "Flying Machine", elixir: 4, rarity: "rare", type: "troop" },
  { id: 26000076, name: "Heal Spirit", elixir: 1, rarity: "rare", type: "troop" },
  { id: 26000077, name: "Royal Delivery", elixir: 3, rarity: "rare", type: "spell" },
  { id: 26000104, name: "Witch", elixir: 5, rarity: "rare", type: "troop" },

  // ── Common ──
  { id: 26000078, name: "Knight", elixir: 3, rarity: "common", type: "troop" },
  { id: 26000079, name: "Archers", elixir: 3, rarity: "common", type: "troop" },
  { id: 26000080, name: "Minions", elixir: 3, rarity: "common", type: "troop" },
  { id: 26000081, name: "Spear Goblins", elixir: 2, rarity: "common", type: "troop" },
  { id: 26000082, name: "Goblins", elixir: 2, rarity: "common", type: "troop" },
  { id: 26000083, name: "Skeletons", elixir: 1, rarity: "common", type: "troop" },
  { id: 26000084, name: "Bomber", elixir: 2, rarity: "common", type: "troop" },
  { id: 26000085, name: "Mortar", elixir: 4, rarity: "common", type: "building" },
  { id: 26000086, name: "X-Bow", elixir: 6, rarity: "common", type: "building" },
  { id: 26000087, name: "Cannon", elixir: 3, rarity: "common", type: "building" },
  { id: 26000088, name: "Fire Spirit", elixir: 2, rarity: "common", type: "troop" },
  { id: 26000089, name: "Ice Spirit", elixir: 1, rarity: "common", type: "troop" },
  { id: 26000090, name: "Electro Spirit", elixir: 1, rarity: "common", type: "troop" },
  { id: 26000091, name: "Zap", elixir: 2, rarity: "common", type: "spell" },
  { id: 26000092, name: "Arrows", elixir: 3, rarity: "common", type: "spell" },
  { id: 26000094, name: "The Log", elixir: 2, rarity: "common", type: "spell" },
  { id: 26000095, name: "Goblin Gang", elixir: 3, rarity: "common", type: "troop" },
  { id: 26000096, name: "Minion Horde", elixir: 5, rarity: "common", type: "troop" },
  { id: 26000097, name: "Barbarians", elixir: 5, rarity: "common", type: "troop" },
  { id: 26000098, name: "Rascals", elixir: 5, rarity: "common", type: "troop" },
  { id: 26000099, name: "Bats", elixir: 2, rarity: "common", type: "troop" },
  { id: 26000100, name: "Royal Recruits", elixir: 7, rarity: "common", type: "troop" },
  { id: 26000101, name: "Skeleton Barrel", elixir: 3, rarity: "common", type: "troop" },
  { id: 26000102, name: "Giant Snowball", elixir: 2, rarity: "common", type: "spell" },
  { id: 26000103, name: "Goblin Cage", elixir: 4, rarity: "common", type: "building" },
  { id: 26000105, name: "Firecracker", elixir: 3, rarity: "common", type: "troop" },
];

const CARD_ID_MAP = new Map<number, CardInfo>(CARDS.map((c) => [c.id, c]));
export function findCard(name: string): CardInfo | undefined {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/^the\s+/i, "").replace(/\./g, "").replace(/ evolution$/i, "");
  const target = normalize(name);
  return CARDS.find((c) => normalize(c.name) === target);
}

export function findCardById(id: number | string): CardInfo | undefined {
  const numId = typeof id === "string" ? parseInt(id, 10) : id;
  return CARD_ID_MAP.get(numId);
}

export function getCardsByNames(names: string[]): CardInfo[] {
  return names
    .map((n) => findCard(n))
    .filter((c): c is CardInfo => c !== undefined);
}

export function stripEvolution(name: string): string {
  return name.replace(/ evolution$/i, "").replace(/ evolved$/i, "").replace(/ \(hero\)$/i, "").trim();
}

export function isEvolved(name: string): boolean {
  // Returns true for cards whose name ends with "evolution" or "evolved"
  return /(?:evolution|evolved)/i.test(name);
}

/**
 * Determines if a card is a hero or an evolution.
 * Handles names like "Archer Queen (Hero)" or cards ending with "-ev".
 */
export function isHeroOrEvo(name: string): boolean {
  const lowered = name.toLowerCase();
  // Hero indicated by "(hero)" or containing "hero"
  const hero = /\(?.*hero.*\)?/i.test(name);
  // Evolution indicated by suffix "-ev" or containing "evolution"/"evolved"
  const evo = /(?:-ev|evolution|evolved)/i.test(name);
  return hero || evo;
}

export interface RawPlayerCard {
  name: string;
  level: number;
  maxLevel: number;
  elixir: number;
  rarity: string;
  iconUrl?: string;
  ratio: number;
  isEvolved: boolean;
}

function getIconUrl(iconUrls?: Record<string, string>): string | undefined {
  if (!iconUrls) return undefined;
  return iconUrls["medium"] ?? iconUrls["default"] ?? Object.values(iconUrls)[0];
}

export function getDisplayLevel(apiLevel: number, rarity: string): number {
  switch (rarity) {
    case "rare": return apiLevel + 2;
    case "epic": return apiLevel + 5;
    case "legendary": return apiLevel + 8;
    case "champion": return apiLevel + 10;
    case "common":
    default:
      return apiLevel;
  }
}

export function deduplicateCards(
  cards: { name: string; level: number; maxLevel: number; iconUrls?: Record<string, string>; evolutionLevel?: number }[]
): RawPlayerCard[] {
  const map = new Map<string, RawPlayerCard>();

  for (const c of cards) {
    const baseName = stripEvolution(c.name);
    const info = findCard(baseName);
    const rarity = info?.rarity ?? "common";
    const displayLevel = getDisplayLevel(c.level, rarity);
    const displayMaxLevel = getDisplayLevel(c.maxLevel, rarity);

    const ratio = displayMaxLevel > 0 ? displayLevel / displayMaxLevel : 0;
    const existing = map.get(baseName);
    
    // Determinar si la carta está evolucionada
    // Solo confiar en evolutionLevel del API; no adivinar por maxLevel
    // (maxLevel inflado causa falsos positivos)
    const isEvolved = c.evolutionLevel != null && c.evolutionLevel > 0;

    const card: RawPlayerCard = {
      name: baseName,
      level: displayLevel,
      maxLevel: displayMaxLevel,
      elixir: info?.elixir ?? 3,
      rarity,
      iconUrl: getIconUrl(c.iconUrls),
      ratio: Math.round(ratio * 100) / 100,
      isEvolved,
    };

    if (!existing || isEvolved || ratio > existing.ratio) {
      map.set(baseName, card);
    }
  }

  return Array.from(map.values());
}

export function toCardSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/["']/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function getDeckShareLink(cardNames: string[]): string {
  const ids = cardNames
    .map((name) => {
      const base = stripEvolution(name);
      const card = findCard(base);
      return card ? card.id.toString() : null;
    })
    .filter(Boolean)
    .join(";");
  if (!ids) return "";
  return `https://link.clashroyale.com/en/?clashroyale://copyDeck?deck=${ids}`;
}

const CARD_IMAGE_BASE = "https://cdn.royaleapi.com/static/img/cards";

export function isCardEvolved(
  evolutionLevel: number | undefined
): boolean {
  return evolutionLevel != null && evolutionLevel > 0;
}

export function getCardImageUrl(name: string, isEvolvedFlag?: boolean): string {
  const card = findCard(name);
  const baseName = card?.name ?? name;
  const slug = toCardSlug(baseName);
  const evoSuffix = isEvolvedFlag ? "-evo" : "";
  return `${CARD_IMAGE_BASE}/${slug}${evoSuffix}.png`;
}
