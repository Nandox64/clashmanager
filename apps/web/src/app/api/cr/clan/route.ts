import { NextResponse } from "next/server";
import { getClan } from "@/lib/cr-api";
import { CRApiClientError } from "@/lib/cr-api";

export async function GET() {
  try {
    const clan = await getClan();
    return NextResponse.json(clan);
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
