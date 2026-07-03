import { NextResponse } from "next/server";
import { getSessionEmployee } from "@/lib/auth";

export async function GET() {
  const employee = await getSessionEmployee();
  if (!employee) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ employee });
}
