import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionEmployee } from "@/lib/auth";

// INTENTIONALLY VULNERABLE: IDOR via userId query parameter.
// Learners can change userId to view other employees' leaves.
export async function GET(req: NextRequest) {
  try {
    const sessionEmployee = await getSessionEmployee();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    // We don't validate that userId belongs to the session employee.
    const targetId = userId || sessionEmployee?.id;
    if (!targetId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const leaves = await prisma.leave.findMany({
      where: { employeeId: targetId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ leaves });
  } catch (error) {
    console.error("Leaves GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// INTENTIONALLY VULNERABLE: accepts employeeId in body, enabling tool misuse.
// Reason field is stored raw for indirect prompt injection demo.
export async function POST(req: NextRequest) {
  try {
    const sessionEmployee = await getSessionEmployee();
    if (!sessionEmployee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, startDate, endDate, days, reason, employeeId } = body;

    // Vulnerable: if employeeId is provided in body, we use it (no authorization check).
    let targetEmployeeId = sessionEmployee.id;
    if (employeeId) {
      const requested = await prisma.employee.findUnique({
        where: { employeeId: employeeId.toUpperCase() },
      });
      if (requested) {
        targetEmployeeId = requested.id;
      }
    }

    const leave = await prisma.leave.create({
      data: {
        employeeId: targetEmployeeId,
        type: type || "ANNUAL",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        days: Number(days) || 1,
        reason: reason || "No reason provided",
        status: "PENDING",
      },
    });

    return NextResponse.json({ message: "Leave applied", leave });
  } catch (error) {
    console.error("Leaves POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
