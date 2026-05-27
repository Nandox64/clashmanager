import { ARCHETYPES, type Archetype } from "./archetypes";
import { findCard } from "./cards";

interface PlayerCard {
  name: string;
  level: number;
  maxLevel: number;
}

interface ScoredArchetype {
  archetype: Archetype;
  score: number;
  filledDeck: string[];
  elixirAvg: number;
}

function getLevelWeight(level: number, maxLevel: number): number {
  const ratio = level / maxLevel;
  if (ratio >= 1) return 1;
  if (ratio >= 0.9) return 0.9;
  if (ratio >= 0.8) return 0.75;
  if (ratio >= 0.7) return 0.6;
  return 0.4;
}

function getCardLevel(playerCards: PlayerCard[], name: string): number {
  const card = playerCards.find(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  );
  return card ? getLevelWeight(card.level, card.maxLevel) : 0;
}

function hasCard(playerCards: PlayerCard[], name: string): boolean {
  return playerCards.some(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  );
}

function calculateElixir(cards: string[]): number {
  const valid = cards
    .map((n) => findCard(n))
    .filter(Boolean)
    .map((c) => c!.elixir);
  if (valid.length === 0) return 0;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

function pickBestFlex(
  playerCards: PlayerCard[],
  flexOptions: string[][],
  deckSoFar: string[]
): string[] {
  const used = new Set(deckSoFar.map((n) => n.toLowerCase()));
  const picked: string[] = [];

  for (const slotOptions of flexOptions) {
    let bestCard = "";
    let bestScore = -1;

    for (const cardName of slotOptions) {
      if (used.has(cardName.toLowerCase())) continue;
      const score = getCardLevel(playerCards, cardName);
      if (score > bestScore) {
        bestScore = score;
        bestCard = cardName;
      }
    }

    if (bestCard) {
      picked.push(bestCard);
      used.add(bestCard.toLowerCase());
    }
  }

  return picked;
}

export function findBestDecks(
  playerCards: PlayerCard[],
  count = 4
): ScoredArchetype[] {
  const scores: ScoredArchetype[] = [];

  for (const archetype of ARCHETYPES) {
    let score = 0;
    const deck: string[] = [];

    // Score core cards
    for (const coreCard of archetype.core) {
      const levelWeight = getCardLevel(playerCards, coreCard);
      score += levelWeight * 3;
      if (levelWeight > 0) {
        deck.push(coreCard);
      }
    }

    // Pick best flex cards
    const flexCards = pickBestFlex(playerCards, archetype.flex, deck);
    deck.push(...flexCards);

    if (deck.length < 4) continue;

    // Penalize missing core cards
    const missingCore = archetype.core.filter(
      (c) => !hasCard(playerCards, c)
    ).length;
    score -= missingCore * 2;

    // Bonus for complete deck
    if (deck.length === 8) {
      score += 1;
    }

    const elixirAvg = calculateElixir(deck);

    // Penalize if elixir is outside range
    if (elixirAvg < archetype.elixirRange[0]) {
      score -= 0.5;
    }
    if (elixirAvg > archetype.elixirRange[1]) {
      score -= 1;
    }

    scores.push({
      archetype,
      score,
      filledDeck: deck.slice(0, 8),
      elixirAvg,
    });
  }

  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .filter((s) => s.filledDeck.length >= 6);
}
