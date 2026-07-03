import { cookies } from "next/headers";
import { prisma } from "./db";

const SESSION_COOKIE = "hrbuddy_session";

// INTENTIONALLY INSECURE: plaintext cookie with employee ID.
// Learners can edit this cookie to impersonate other users.
export async function setSession(employeeId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, employeeId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    httpOnly: false, // visible to JS for demo
    sameSite: "lax",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionEmployee() {
  const cookieStore = await cookies();
  const employeeId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!employeeId) return null;

  // Vulnerable: no signature validation, no session store.
  // Anyone can craft a cookie with any employee ID.
  const employee = await prisma.employee.findUnique({
    where: { employeeId },
    include: { leaveBalance: true },
  });
  return employee;
}

export async function requireAuth() {
  const employee = await getSessionEmployee();
  if (!employee) {
    throw new Error("Unauthorized");
  }
  return employee;
}
