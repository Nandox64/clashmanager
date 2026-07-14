import { NextResponse } from "next/server";
import { getClanFull } from "@/lib/cr-api";
import {
  transformClan,
  transformMembers,
  transformToWeeklyStats,
} from "@/lib/cr-transform";
import { CRApiClientError } from "@/lib/cr-api";
import { getMembersFromFirestore } from "@/lib/firestore-service";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const { clan, riverRaceLog, currentRiverRace } = await getClanFull();

    const clanTag = process.env.CLAN_TAG;
    let prevDonations: Map<string, number> | undefined;
    if (adminDb && clanTag) {
      const storedMembers = await getMembersFromFirestore(clanTag).catch(() => []);
      if (storedMembers.length > 0) {
        prevDonations = new Map(storedMembers.map(m => [m.playerTag, m.donations]));
      }
    }
    if (!prevDonations) {
      prevDonations = new Map(clan.memberList.map(m => [m.tag, m.donations]));
    }

    const data = {
      clan: transformClan(clan),
      members: transformMembers(clan.memberList, {
        previousDonations: prevDonations,
        currentRaceParticipants: currentRiverRace?.participants,
      }),
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
