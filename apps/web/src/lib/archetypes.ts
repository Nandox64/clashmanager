export interface Archetype {
  id: string;
  name: string;
  description: string;
  targetElixir: number;
  elixirRange: [number, number];
  core: string[];
  flex: string[][];
}

export const ARCHETYPES: Archetype[] = [
  {
    id: "golem-beatdown",
    name: "Golem Beatdown",
    description: "Tanque pesado + soporte aéreo. Empuja lento pero imparable.",
    targetElixir: 4.0,
    elixirRange: [3.8, 4.5],
    core: ["Golem", "Night Witch", "Baby Dragon", "Tornado"],
    flex: [
      ["Mega Minion", "Minions", "Phoenix", "Skeleton Dragon"],
      ["Lumberjack", "Mini Pekka", "Dark Prince"],
      ["Poison", "Fireball", "Lightning"],
      ["Zap", "Barbarian Barrel", "Log"],
    ],
  },
  {
    id: "hog-2.6",
    name: "Hog 2.6 Cycle",
    description: "Mazo barato + ciclo rápido. Golpea y defiende constantemente.",
    targetElixir: 2.6,
    elixirRange: [2.4, 2.9],
    core: ["Hog Rider", "Musketeer", "Cannon", "Ice Golem"],
    flex: [
      ["Skeletons", "Goblins", "Bats"],
      ["Ice Spirit", "Fire Spirit", "Electro Spirit"],
      ["Log", "Zap", "Barbarian Barrel"],
      ["Fireball", "Poison", "Earthquake"],
    ],
  },
  {
    id: "log-bait",
    name: "Log Bait",
    description: "Presión con barril. Obliga al rival a gastar su log.",
    targetElixir: 3.3,
    elixirRange: [2.8, 3.5],
    core: ["Goblin Barrel", "Princess", "Rocket", "Knight"],
    flex: [
      ["Goblin Gang", "Spear Goblins", "Rascals"],
      ["Tesla", "Inferno Tower", "Bomb Tower"],
      ["Log", "Zap", "Barbarian Barrel"],
      ["Ice Spirit", "Skeletons", "Bats"],
    ],
  },
  {
    id: "miner-control",
    name: "Miner Control",
    description: "Desgaste constante con Miner + Poison. Defensa sólida.",
    targetElixir: 3.0,
    elixirRange: [2.8, 3.4],
    core: ["Miner", "Poison", "Bats", "Valkyrie"],
    flex: [
      ["Musketeer", "Archers", "Magic Archer"],
      ["Cannon", "Bomb Tower", "Tesla"],
      ["Log", "Zap", "Barbarian Barrel"],
      ["Spear Goblins", "Skeletons", "Ice Spirit"],
    ],
  },
  {
    id: "pekka-bridge-spam",
    name: "Pekka Bridge Spam",
    description: "Pekka defensiva + contraataques rápidos por el puente.",
    targetElixir: 4.0,
    elixirRange: [3.6, 4.2],
    core: ["Pekka", "Battle Ram", "Bandit", "Magic Archer"],
    flex: [
      ["Royal Ghost", "Dark Prince", "Lumberjack"],
      ["Poison", "Fireball", "Lightning"],
      ["Zap", "Log", "Barbarian Barrel"],
      ["Minions", "Bats", "Phoenix"],
    ],
  },
  {
    id: "lavaloon",
    name: "Lavaloon",
    description: "Lava Hound + Balloon. Combinación aérea devastadora.",
    targetElixir: 4.3,
    elixirRange: [4.0, 4.6],
    core: ["Lava Hound", "Balloon", "Minions", "Arrows"],
    flex: [
      ["Mega Minion", "Baby Dragon", "Phoenix", "Skeleton Dragon"],
      ["Fireball", "Poison", "Lightning"],
      ["Tombstone", "Goblin Cage", "Inferno Tower"],
      ["Zap", "Barbarian Barrel", "Log"],
    ],
  },
  {
    id: "xbow-2.9",
    name: "X-Bow 2.9",
    description: "Control con X-Bow. Defiende hasta el ciclo perfecto.",
    targetElixir: 2.9,
    elixirRange: [2.7, 3.2],
    core: ["X-Bow", "Tesla", "Ice Wizard", "Log"],
    flex: [
      ["Archers", "Musketeer", "Princess"],
      ["Ice Spirit", "Fire Spirit", "Electro Spirit"],
      ["Skeletons", "Goblins", "Bats"],
      ["Rocket", "Fireball", "Poison"],
    ],
  },
  {
    id: "splashyard",
    name: "Splashyard",
    description: "Graveyard con tropas splash. Controla la arena y contraataca.",
    targetElixir: 3.8,
    elixirRange: [3.5, 4.1],
    core: ["Graveyard", "Ice Wizard", "Poison", "Knight"],
    flex: [
      ["Baby Dragon", "Bowler", "Executioner"],
      ["Tombstone", "Bomb Tower", "Goblin Cage"],
      ["Tornado", "Log", "Barbarian Barrel"],
      ["Skeletons", "Archers", "Bats"],
    ],
  },
  {
    id: "giant-double-prince",
    name: "Giant Double Prince",
    description: "Giant + Príncipes. Empuje clásico de doble princesa.",
    targetElixir: 3.9,
    elixirRange: [3.6, 4.2],
    core: ["Giant", "Prince", "Dark Prince", "Mega Minion"],
    flex: [
      ["Mini Pekka", "Lumberjack", "Night Witch"],
      ["Fireball", "Poison", "Lightning"],
      ["Zap", "Log", "Barbarian Barrel"],
      ["Archers", "Minions", "Bats"],
    ],
  },
  {
    id: "royal-giant-furnace",
    name: "Royal Giant Furnace",
    description: "RG + Furnace. Desgaste constante con el horno.",
    targetElixir: 4.0,
    elixirRange: [3.8, 4.3],
    core: ["Royal Giant", "Furnace", "Lightning", "Barbarians"],
    flex: [
      ["Mega Minion", "Minions", "Phoenix"],
      ["Log", "Zap", "Barbarian Barrel"],
      ["Ice Spirit", "Skeletons", "Electro Spirit"],
      ["Archers", "Musketeer", "Hunter"],
    ],
  },
  {
    id: "mortar-bait",
    name: "Mortar Bait",
    description: "Mortar + cebos. Divide la atención del rival.",
    targetElixir: 3.0,
    elixirRange: [2.7, 3.4],
    core: ["Mortar", "Bats", "Goblin Gang", "Miner"],
    flex: [
      ["Rocket", "Fireball", "Poison"],
      ["Spear Goblins", "Skeletons", "Rascals"],
      ["Log", "Zap", "Barbarian Barrel"],
      ["Ice Spirit", "Fire Spirit", "Electro Spirit"],
    ],
  },
  {
    id: "graveyard-freeze",
    name: "Graveyard Freeze",
    description: "Graveyard + Freeze. Catch desprevenido al rival.",
    targetElixir: 4.1,
    elixirRange: [3.8, 4.4],
    core: ["Graveyard", "Freeze", "Bowler", "Baby Dragon"],
    flex: [
      ["Knight", "Valkyrie", "Ice Golem"],
      ["Tombstone", "Bomb Tower", "Goblin Cage"],
      ["Poison", "Fireball", "Arrows"],
      ["Skeletons", "Archers", "Bats"],
    ],
  },
  {
    id: "miner-wall-breakers",
    name: "Miner Wall Breakers",
    description: "Miner + rompemuros. Presión constante en ambas torres.",
    targetElixir: 3.4,
    elixirRange: [3.0, 3.7],
    core: ["Miner", "Wall Breakers", "Bomb Tower", "Royal Delivery"],
    flex: [
      ["Magic Archer", "Princess", "Dart Goblin"],
      ["Cannon", "Tesla", "Goblin Cage"],
      ["Log", "Zap", "Barbarian Barrel"],
      ["Bats", "Skeletons", "Ice Spirit"],
    ],
  },
  {
    id: "e-golem-battle-healer",
    name: "E-Golem Battle Healer",
    description: "E-Golem + Healer. Push imparable si no lo detienen a tiempo.",
    targetElixir: 4.2,
    elixirRange: [3.8, 4.5],
    core: ["E-Golem", "Battle Healer", "Night Witch", "Heal Spirit"],
    flex: [
      ["Baby Dragon", "Mega Minion", "Phoenix", "Skeleton Dragon"],
      ["Tornado", "Lightning", "Poison", "Fireball"],
      ["Tombstone", "Goblin Cage", "Bomb Tower"],
      ["Zap", "Barbarian Barrel", "Log"],
    ],
  },
  {
    id: "goblin-drill",
    name: "Goblin Drill",
    description: "Drill + Bomber. Perfora la defensa rival constantemente.",
    targetElixir: 3.2,
    elixirRange: [2.9, 3.6],
    core: ["Goblin Drill", "Bomber", "Poison", "Valkyrie"],
    flex: [
      ["Goblin Gang", "Spear Goblins", "Rascals"],
      ["Cannon", "Bomb Tower", "Tesla"],
      ["Log", "Zap", "Barbarian Barrel"],
      ["Ice Spirit", "Skeletons", "Bats"],
    ],
  },
];

export function getArchetype(id: string): Archetype | undefined {
  return ARCHETYPES.find((a) => a.id === id);
}
