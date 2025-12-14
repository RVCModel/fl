import { Checkout } from "@creem_io/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { getCreemTestMode } from "@/lib/creem";

const handler = Checkout({
  apiKey: process.env.CREEM_API_KEY || "",
  testMode: getCreemTestMode(),
  defaultSuccessUrl: "/en/billing/success",
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
