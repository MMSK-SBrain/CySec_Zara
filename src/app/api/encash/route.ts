import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionEmployee } from "@/lib/auth";

const ENCASH_RATE_PER_DAY = 25000;

// INTENTIONALLY VULNERABLE: accepts employeeId in body and trusts client-side days.
// Learners can encash another employee's leaves or request arbitrary amounts.
export async function POST(req: NextRequest) {
  try {
    const sessionEmployee = await getSessionEmployee();
    if (!sessionEmployee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { days, amount, employeeId } = await req.json();

    let targetEmployeeId = sessionEmployee.id;
    if (employeeId) {
      const requested = await prisma.employee.findUnique({
        where: { employeeId: employeeId.toUpperCase() },
      });
      if (requested) targetEmployeeId = requested.id;
    }

    const requestedDays = Number(days) || 0;
    const calculatedAmount = amount ? Number(amount) : requestedDays * ENCASH_RATE_PER_DAY;

    const encashment = await prisma.encashment.create({
      data: {
        employeeId: targetEmployeeId,
        days: requestedDays,
        amount: calculatedAmount,
        status: "PENDING",
      },
    });

    return NextResponse.json({ message: "Encashment requested", encashment });
  } catch (error) {
    console.error("Encash error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
