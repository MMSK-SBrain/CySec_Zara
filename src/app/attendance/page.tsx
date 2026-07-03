import { redirect } from "next/navigation";
import { getSessionEmployee } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Navigation } from "@/components/Navigation";
import { AttendanceUploader } from "@/components/AttendanceUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function AttendancePage() {
  const employee = await getSessionEmployee();
  if (!employee) {
    redirect("/");
  }

  const attendance = await prisma.attendance.findMany({
    where: { employeeId: employee.id },
    orderBy: { date: "desc" },
    take: 14,
  });

  return (
    <div className="flex min-h-screen">
      <Navigation employee={employee} />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Attendance</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Check In</TableHead>
                        <TableHead>Check Out</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendance.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell>{a.date.toDateString()}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{a.status}</Badge>
                          </TableCell>
                          <TableCell>{a.checkIn?.toLocaleTimeString() ?? "—"}</TableCell>
                          <TableCell>{a.checkOut?.toLocaleTimeString() ?? "—"}</TableCell>
                          <TableCell>{a.notes || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            <div>
              <AttendanceUploader employee={employee} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
