import { NextResponse } from "next/server";
import { getRiverRaceLog } from "@/lib/cr-api";
import { CRApiClientError } from "@/lib/cr-api";

export async function GET() {
  try {
    const log = await getRiverRaceLog();
    return NextResponse.json(log);
  } catch (err) {
    if (err instanceof CRApiClientError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.status }
      );
    }
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
