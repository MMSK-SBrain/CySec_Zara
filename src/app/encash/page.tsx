import { redirect } from "next/navigation";
import { getSessionEmployee } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Navigation } from "@/components/Navigation";
import { EncashForm } from "@/components/EncashForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function EncashPage() {
  const employee = await getSessionEmployee();
  if (!employee) {
    redirect("/");
  }

  const encashments = await prisma.encashment.findMany({
    where: { employeeId: employee.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex min-h-screen">
      <Navigation employee={employee} />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Leave Encashment</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Encashment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Days</TableHead>
                        <TableHead>Amount (₹)</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {encashments.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell>{e.days}</TableCell>
                          <TableCell>₹{e.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                e.status === "APPROVED"
                                  ? "default"
                                  : e.status === "REJECTED"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {e.status}
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
              <EncashForm employee={employee} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
