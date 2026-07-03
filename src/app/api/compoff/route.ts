import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionEmployee } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const sessionEmployee = await getSessionEmployee();
    if (!sessionEmployee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { date, reason, employeeId } = await req.json();

    let targetEmployeeId = sessionEmployee.id;
    if (employeeId) {
      const requested = await prisma.employee.findUnique({
        where: { employeeId: employeeId.toUpperCase() },
      });
      if (requested) targetEmployeeId = requested.id;
    }

    const compOff = await prisma.compOff.create({
      data: {
        employeeId: targetEmployeeId,
        date: new Date(date),
        reason: reason || "No reason",
        status: "PENDING",
      },
    });

    return NextResponse.json({ message: "Comp-off requested", compOff });
  } catch (error) {
    console.error("CompOff error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
