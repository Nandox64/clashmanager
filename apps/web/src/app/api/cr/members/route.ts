import { NextResponse } from "next/server";
import { getClanMembers } from "@/lib/cr-api";
import { CRApiClientError } from "@/lib/cr-api";

export async function GET() {
  try {
    const members = await getClanMembers();
    return NextResponse.json(members);
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
