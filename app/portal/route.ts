import { Portal } from "@creem_io/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { getCreemTestMode } from "@/lib/creem";

const handler = Portal({
  apiKey: process.env.CREEM_API_KEY || "",
  testMode: getCreemTestMode(),
});

export async function GET(req: NextRequest) {
  if (!process.env.CREEM_API_KEY) {
    return NextResponse.json(
      { error: "Missing CREEM_API_KEY" },
      { status: 500 },
    );
  }
  return handler(req);
}
