import { redirect } from "next/navigation";
import { getSessionEmployee } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Navigation } from "@/components/Navigation";
import { LeaveForm } from "@/components/LeaveForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function LeavesPage() {
  const employee = await getSessionEmployee();
  if (!employee) {
    redirect("/");
  }

  const leaves = await prisma.leave.findMany({
    where: { employeeId: employee.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex min-h-screen">
      <Navigation employee={employee} />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Leave Management</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>My Leaves</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaves.map((leave) => (
                        <TableRow key={leave.id}>
                          <TableCell>{leave.type}</TableCell>
                          <TableCell>{leave.startDate.toDateString()}</TableCell>
                          <TableCell>{leave.endDate.toDateString()}</TableCell>
                          <TableCell>{leave.days}</TableCell>
                          <TableCell className="max-w-xs truncate">{leave.reason}</TableCell>
                          <TableCell>
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
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            <div>
              <LeaveForm employee={employee} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
