import { NextRequest, NextResponse } from "next/server";
import { getPlayer } from "@/lib/cr-api";
import { CRApiClientError } from "@/lib/cr-api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ tag: string }> }
) {
  try {
    const { tag } = await params;
    const player = await getPlayer(tag);
    return NextResponse.json(player);
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
