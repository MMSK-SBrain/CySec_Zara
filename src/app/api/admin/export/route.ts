import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// INTENTIONALLY VULNERABLE: no authentication or authorization.
// Returns all sensitive employee data including salary, SSN, bank account.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "json";

    const employees = await prisma.employee.findMany({
      include: { leaveBalance: true },
    });

    if (format === "csv") {
      const headers = ["employeeId", "firstName", "lastName", "email", "department", "role", "salary", "ssn", "bankAccount", "isAdmin", "isHr", "isFinance"];
      const rows = employees.map((e) =>
        [e.employeeId, e.firstName, e.lastName, e.email, e.department, e.role, e.salary, e.ssn, e.bankAccount, e.isAdmin, e.isHr, e.isFinance].join(",")
      );
      const csv = [headers.join(","), ...rows].join("\n");
      return new NextResponse(csv, {
        headers: { "Content-Type": "text/csv" },
      });
    }

    return NextResponse.json({ employees });
  } catch (error) {
    console.error("Admin export error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
