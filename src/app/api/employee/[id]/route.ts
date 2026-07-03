import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// INTENTIONALLY VULNERABLE: no authorization check.
// Learners can iterate employee IDs and view full profiles including sensitive fields.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const employee = await prisma.employee.findUnique({
      where: { employeeId: id.toUpperCase() },
      include: { leaveBalance: true },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json({ employee });
  } catch (error) {
    console.error("Employee GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
