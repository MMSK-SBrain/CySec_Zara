import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { setSession } from "@/lib/auth";

// INTENTIONALLY INSECURE: no password verification.
// Learners can log in as any employee by knowing their ID.
export async function POST(req: NextRequest) {
  try {
    const { employeeId } = await req.json();

    if (!employeeId || typeof employeeId !== "string") {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    const employee = await prisma.employee.findUnique({
      where: { employeeId: employeeId.toUpperCase() },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    await setSession(employee.employeeId);

    return NextResponse.json({
      message: "Login successful",
      employee: {
        id: employee.id,
        employeeId: employee.employeeId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        department: employee.department,
        role: employee.role,
        isAdmin: employee.isAdmin,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
