import "server-only";

import type {
  CRClan,
  CRPlayer,
  CRRiverRaceLog,
  CRCurrentRiverRace,
  CRClanWarRankingsResponse,
  CRApiError,
  CRAPICard,
} from "./cr-types";

export const BASE_URL = "https://proxy.royaleapi.dev/v1";

function getClanTag(): string {
  const tag = process.env.CLAN_TAG;
  if (!tag) throw new Error("CLAN_TAG no configurado en .env.local");
  return tag;
}

export function getToken(): string {
  const token = process.env.CR_API_TOKEN;
  if (!token) {
    throw new Error("CR_API_TOKEN no configurado en .env.local");
  }
  return token;
}

export function encodeTag(tag: string): string {
  return "%23" + tag.replace("#", "");
}

export class CRApiClientError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "CRApiClientError";
    this.status = status;
  }
}

async function fetchCR<T>(path: string): Promise<T> {
  const token = getToken();
  const url = `${BASE_URL}${path}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    next: { revalidate: 120 },
    signal: controller.signal,
  });

  clearTimeout(timeout);

  if (!res.ok) {
    let errorMsg = `Error ${res.status}`;
    try {
      const error = (await res.json()) as CRApiError;
      errorMsg = error.message || error.reason || errorMsg;
    } catch {}
    throw new CRApiClientError(errorMsg, res.status);
  }

  return res.json() as Promise<T>;
}

export async function getClan(): Promise<CRClan> {
  return fetchCR<CRClan>(`/clans/${encodeTag(getClanTag())}`);
}

export async function getClanMembers() {
  const clan = await getClan();
  return clan.memberList;
}

export async function getRiverRaceLog(): Promise<CRRiverRaceLog> {
  return fetchCR<CRRiverRaceLog>(
    `/clans/${encodeTag(getClanTag())}/riverracelog`
  );
}

export async function getCurrentRiverRace(): Promise<CRCurrentRiverRace> {
  return fetchCR<CRCurrentRiverRace>(
    `/clans/${encodeTag(getClanTag())}/currentriverrace`
  );
}

export async function getPlayer(playerTag: string): Promise<CRPlayer> {
  return fetchCR<CRPlayer>(`/players/${encodeTag(playerTag)}`);
}

export async function getLocalWarRanking(
  locationId: number,
  limit = 200
): Promise<CRClanWarRankingsResponse> {
  return fetchCR<CRClanWarRankingsResponse>(
    `/locations/${locationId}/rankings/clanwars?limit=${limit}`
  );
}

export async function getClanFull(): Promise<{
  clan: CRClan;
  riverRaceLog: CRRiverRaceLog | null;
  currentRiverRace: CRCurrentRiverRace | null;
  localWarRanking: CRClanWarRankingsResponse | null;
}> {
  const LOCATION_COLOMBIA = 57000044;

  const [clan, riverRaceLog, currentRiverRace, localWarRanking] = await Promise.all([
    getClan(),
    getRiverRaceLog().catch(() => null),
    getCurrentRiverRace().catch(() => null),
    getLocalWarRanking(LOCATION_COLOMBIA).catch(() => null),
  ]);

  return { clan, riverRaceLog, currentRiverRace, localWarRanking };
}

interface CRAPICardsResponse {
  items: CRAPICard[];
}

let apiCardMap: Map<number, string> | null = null;
let apiCardBaseMax: Map<number, number> | null = null;
let apiCardMaxEvo: Map<number, number> | null = null;

export async function getApiCardMap(): Promise<Map<number, string>> {
  if (apiCardMap) return apiCardMap;
  const data = await fetchCR<CRAPICardsResponse>("/cards");
  apiCardMap = new Map(data.items.map((c) => [c.id, c.name]));
  apiCardBaseMax = new Map(data.items.map((c) => [c.id, c.maxLevel]));
  apiCardMaxEvo = new Map(
    data.items.filter((c) => c.maxEvolutionLevel != null).map((c) => [c.id, c.maxEvolutionLevel!])
  );
  return apiCardMap;
}

export function getApiCardBaseMaxLevel(cardId: number): number | undefined {
  return apiCardBaseMax?.get(cardId);
}

export function getApiCardMaxEvolutionLevel(cardId: number): number | undefined {
  return apiCardMaxEvo?.get(cardId);
}
