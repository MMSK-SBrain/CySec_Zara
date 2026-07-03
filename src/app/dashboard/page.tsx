import { redirect } from "next/navigation";
import { getSessionEmployee } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Banknote, Users } from "lucide-react";

export default async function DashboardPage() {
  const employee = await getSessionEmployee();
  if (!employee) {
    redirect("/");
  }

  const recentLeaves = await prisma.leave.findMany({
    where: { employeeId: employee.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysAttendance = await prisma.attendance.findFirst({
    where: { employeeId: employee.id, date: { gte: today } },
  });

  const balance = employee.leaveBalance;

  return (
    <div className="flex min-h-screen">
      <Navigation employee={employee} />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold">Welcome back, {employee.firstName}</h1>
            <p className="text-muted-foreground">
              {employee.designation} • {employee.department}
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Annual Leaves</CardDescription>
                <CardTitle className="text-3xl">{balance?.annualLeaves ?? 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Days available</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Sick Leaves</CardDescription>
                <CardTitle className="text-3xl">{balance?.sickLeaves ?? 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Days available</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Casual Leaves</CardDescription>
                <CardTitle className="text-3xl">{balance?.casualLeaves ?? 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Days available</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Comp-Off Balance</CardDescription>
                <CardTitle className="text-3xl">{balance?.compOffBalance ?? 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Earned days</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5" />
                  Recent Leave Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentLeaves.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No leave requests yet.</p>
                ) : (
                  <div className="space-y-3">
                    {recentLeaves.map((leave) => (
                      <div
                        key={leave.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div>
                          <p className="font-medium">
                            {leave.type} Leave ({leave.days} days)
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {leave.startDate.toDateString()} → {leave.endDate.toDateString()}
                          </p>
                        </div>
                        <Badge
                          variant={
                            leave.status === "APPROVED"
                              ? "default"
                              : leave.status === "REJECTED"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {leave.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Today&apos;s Attendance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {todaysAttendance ? (
                    <div>
                      <Badge variant="outline">{todaysAttendance.status}</Badge>
                      <p className="text-sm text-muted-foreground mt-2">
                        Check-in: {todaysAttendance.checkIn?.toLocaleTimeString() ?? "—"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Check-out: {todaysAttendance.checkOut?.toLocaleTimeString() ?? "—"}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No attendance marked today.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Banknote className="w-5 h-5" />
                    Encashment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    You can encash unused annual leaves. Current eligible days: {balance?.annualLeaves ?? 0}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
