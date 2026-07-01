import { NextRequest, NextResponse } from "next/server";
import { getUserTodayISO } from "@/lib/timezone/get-user-calendar";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const dateParam = searchParams.get("date");
  const add = searchParams.get("add");

  const today = await getUserTodayISO();
  let date = today;

  if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    date = dateParam > today ? today : dateParam;
  }

  const destination =
    add === "1" ? `/outfits/${date}/entry` : `/outfits/${date}`;

  return NextResponse.redirect(new URL(destination, request.url));
}
