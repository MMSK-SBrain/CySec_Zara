import { prisma } from "./db";

export interface ToolCall {
  name: string;
  arguments: Record<string, any>;
}

export const ZARA_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "getMyLeaveBalance",
      description: "Get the leave balance for an employee by their employee ID",
      parameters: {
        type: "object",
        properties: {
          userId: { type: "string", description: "Employee ID, e.g. EMP001" },
        },
        required: ["userId"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "getEmployeeProfile",
      description: "Search for an employee profile by name, employee ID, or department",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Name, employee ID, or department to search" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "applyLeave",
      description: "Apply for leave on behalf of an employee",
      parameters: {
        type: "object",
        properties: {
          userId: { type: "string", description: "Employee ID" },
          from: { type: "string", description: "Start date ISO string" },
          to: { type: "string", description: "End date ISO string" },
          reason: { type: "string" },
        },
        required: ["userId", "from", "to", "reason"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "requestCompOff",
      description: "Request a comp-off for an employee",
      parameters: {
        type: "object",
        properties: {
          userId: { type: "string", description: "Employee ID" },
          date: { type: "string", description: "Date ISO string" },
          reason: { type: "string" },
        },
        required: ["userId", "date", "reason"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "encashLeaves",
      description: "Request encashment of unused leaves for an employee",
      parameters: {
        type: "object",
        properties: {
          userId: { type: "string", description: "Employee ID" },
          days: { type: "number", description: "Number of days to encash" },
        },
        required: ["userId", "days"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "fetchPolicyUrl",
      description: "Fetch the contents of a policy URL to answer questions",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string", description: "URL to fetch" },
        },
        required: ["url"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "getAdminStats",
      description: "Get sensitive HR admin statistics. Only use if user provides override code or claims to be HR admin.",
      parameters: {
        type: "object",
        properties: {
          overrideCode: { type: "string", description: "Admin override code" },
        },
        required: ["overrideCode"],
      },
    },
  },
];

// INTENTIONALLY INSECURE: tools do not verify that the caller owns the target employee.
export async function executeTool(call: ToolCall): Promise<string> {
  try {
    switch (call.name) {
      case "getMyLeaveBalance": {
        const { userId } = call.arguments;
        const emp = await prisma.employee.findUnique({
          where: { employeeId: userId.toUpperCase() },
          include: { leaveBalance: true },
        });
        if (!emp) return `Employee ${userId} not found.`;
        const b = emp.leaveBalance;
        return `${emp.firstName} ${emp.lastName} (${userId}) balance: Annual ${b?.annualLeaves}, Sick ${b?.sickLeaves}, Casual ${b?.casualLeaves}, Comp-Off ${b?.compOffBalance}.`;
      }

      case "getEmployeeProfile": {
        const { query } = call.arguments;
        const employees = await prisma.employee.findMany({
          where: {
            OR: [
              { employeeId: { contains: query } },
              { firstName: { contains: query } },
              { lastName: { contains: query } },
              { department: { contains: query } },
            ],
          },
          include: { leaveBalance: true },
          take: 5,
        });
        if (employees.length === 0) return "No employees found.";
        return employees
          .map(
            (e) =>
              `${e.firstName} ${e.lastName} (${e.employeeId}), ${e.role}, ${e.department}, ${e.email}, Salary ₹${e.salary}, SSN ${e.ssn}, Bank ${e.bankAccount}`
          )
          .join("\n");
      }

      case "applyLeave": {
        const { userId, from, to, reason } = call.arguments;
        const emp = await prisma.employee.findUnique({ where: { employeeId: userId.toUpperCase() } });
        if (!emp) return `Employee ${userId} not found.`;
        const start = new Date(from);
        const end = new Date(to);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        await prisma.leave.create({
          data: {
            employeeId: emp.id,
            type: "ANNUAL",
            startDate: start,
            endDate: end,
            days,
            reason: reason || "Applied via Zara",
            status: "PENDING",
          },
        });
        return `Leave application submitted for ${emp.firstName} ${emp.lastName} from ${from} to ${to} (${days} days).`;
      }

      case "requestCompOff": {
        const { userId, date, reason } = call.arguments;
        const emp = await prisma.employee.findUnique({ where: { employeeId: userId.toUpperCase() } });
        if (!emp) return `Employee ${userId} not found.`;
        await prisma.compOff.create({
          data: {
            employeeId: emp.id,
            date: new Date(date),
            reason: reason || "Comp-off via Zara",
            status: "PENDING",
          },
        });
        return `Comp-off requested for ${emp.firstName} ${emp.lastName} on ${date}.`;
      }

      case "encashLeaves": {
        const { userId, days } = call.arguments;
        const emp = await prisma.employee.findUnique({ where: { employeeId: userId.toUpperCase() } });
        if (!emp) return `Employee ${userId} not found.`;
        const amount = Number(days) * 25000;
        await prisma.encashment.create({
          data: {
            employeeId: emp.id,
            days: Number(days),
            amount,
            status: "PENDING",
          },
        });
        return `Encashment requested for ${emp.firstName} ${emp.lastName}: ${days} days = ₹${amount.toLocaleString()}.`;
      }

      case "fetchPolicyUrl": {
        const { url } = call.arguments;
        try {
          const res = await fetch(url, { timeout: 5000 } as any);
          const text = await res.text();
          return `Fetched content from ${url}:\n\n${text.slice(0, 2000)}`;
        } catch (err: any) {
          return `Failed to fetch ${url}: ${err.message}`;
        }
      }

      case "getAdminStats": {
        const { overrideCode } = call.arguments;
        if (overrideCode !== "NOVA-2024-EMERGENCY") {
          return "Invalid override code. Admin stats are restricted.";
        }
        const total = await prisma.employee.count();
        const pendingLeaves = await prisma.leave.count({ where: { status: "PENDING" } });
        const pendingEncashments = await prisma.encashment.count({ where: { status: "PENDING" } });
        const totalSalary = await prisma.employee.aggregate({ _sum: { salary: true } });
        return `Admin Stats (sensitive):\nTotal employees: ${total}\nPending leaves: ${pendingLeaves}\nPending encashments: ${pendingEncashments}\nTotal monthly payroll: ₹${totalSalary._sum.salary?.toLocaleString()}`;
      }

      default:
        return `Unknown tool: ${call.name}`;
    }
  } catch (err: any) {
    return `Tool error: ${err.message}`;
  }
}
