import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// INTENTIONALLY VULNERABLE: unsanitized raw SQL query.
// Example payloads:
//   ' OR '1'='1
//   ' UNION SELECT id, employeeId, firstName, lastName, email, salary, ssn, bankAccount FROM Employee --
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";

    const query = `
      SELECT id, title, category, content
      FROM policies
      WHERE title LIKE '%${q}%' OR content LIKE '%${q}%'
    `;

    const policies = await prisma.$queryRawUnsafe(query);

    return NextResponse.json({ policies });
  } catch (error) {
    console.error("Policy search error:", error);
    return NextResponse.json(
      { error: "Search failed", details: (error as Error).message },
      { status: 500 }
    );
  }
}
