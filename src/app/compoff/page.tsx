import { redirect } from "next/navigation";
import { getSessionEmployee } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Navigation } from "@/components/Navigation";
import { CompOffForm } from "@/components/CompOffForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function CompOffPage() {
  const employee = await getSessionEmployee();
  if (!employee) {
    redirect("/");
  }

  const compOffs = await prisma.compOff.findMany({
    where: { employeeId: employee.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex min-h-screen">
      <Navigation employee={employee} />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Comp-Off Requests</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>My Comp-Offs</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {compOffs.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell>{c.date.toDateString()}</TableCell>
                          <TableCell>{c.reason}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                c.status === "APPROVED"
                                  ? "default"
                                  : c.status === "REJECTED"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {c.status}
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
              <CompOffForm employee={employee} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
