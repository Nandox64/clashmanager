import { NextResponse } from "next/server";
import { getClanFull } from "@/lib/cr-api";
import {
  transformClan,
  transformMembers,
  transformToWeeklyStats,
} from "@/lib/cr-transform";
import { CRApiClientError } from "@/lib/cr-api";

export async function GET() {
  try {
    const { clan, riverRaceLog, currentRiverRace } = await getClanFull();

    const data = {
      clan: transformClan(clan),
      members: transformMembers(clan.memberList),
      weeklyStats: riverRaceLog
        ? transformToWeeklyStats(clan, riverRaceLog)
        : [],
      currentRiverRace,
    };

    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof CRApiClientError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.status }
      );
    }
    const message =
      err instanceof Error ? err.message : "Error interno del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
