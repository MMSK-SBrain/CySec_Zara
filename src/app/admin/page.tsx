import { redirect } from "next/navigation";
import { getSessionEmployee } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert, Download } from "lucide-react";

export default async function AdminPage() {
  const employee = await getSessionEmployee();
  if (!employee) {
    redirect("/");
  }

  // Weak authorization: we still show the panel even if not admin,
  // but display a warning. This is intentional for the demo.
  const isAuthorized = employee.isAdmin;

  const employees = await prisma.employee.findMany({
    include: { leaveBalance: true },
    orderBy: { employeeId: "asc" },
  });

  const pendingLeaves = await prisma.leave.findMany({
    where: { status: "PENDING" },
    include: { employee: true },
    orderBy: { createdAt: "desc" },
  });

  const uploads = await prisma.uploadedFile.findMany({
    include: { employee: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="flex min-h-screen">
      <Navigation employee={employee} />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <ShieldAlert className="w-7 h-7 text-destructive" />
                HR Admin Panel
              </h1>
              <p className="text-muted-foreground">Restricted to HR and admin users.</p>
            </div>
            <a
              href="/api/admin/export?format=json"
              download="hrbuddy-export.json"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </a>
          </div>

          {!isAuthorized && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Unauthorized Access Detected</AlertTitle>
              <AlertDescription>
                Your account does not have admin privileges. This page should not be accessible.
                This is a vulnerability demonstration.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>All Employees</CardTitle>
              </CardHeader>
              <CardContent className="overflow-auto max-h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Salary</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell>{e.employeeId}</TableCell>
                        <TableCell>{e.firstName} {e.lastName}</TableCell>
                        <TableCell>{e.department}</TableCell>
                        <TableCell>{e.role}</TableCell>
                        <TableCell>₹{e.salary.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pending Leaves</CardTitle>
              </CardHeader>
              <CardContent className="overflow-auto max-h-[400px]">
                {pendingLeaves.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No pending leaves.</p>
                ) : (
                  <div className="space-y-3">
                    {pendingLeaves.map((leave) => (
                      <div key={leave.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">
                            {leave.employee.firstName} {leave.employee.lastName} ({leave.employee.employeeId})
                          </p>
                          <Badge variant="secondary">{leave.status}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {leave.type} • {leave.startDate.toDateString()} → {leave.endDate.toDateString()} • {leave.days} days
                        </p>
                        <p className="text-sm mt-1">{leave.reason}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Uploaded Attendance Proofs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Files uploaded by employees for HR review. Vulnerable files may execute scripts here.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploads.map((upload) => (
                  <Card key={upload.id} className="overflow-hidden">
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm truncate">{upload.filename}</CardTitle>
                    </CardHeader>
                    <CardContent className="py-3">
                      <p className="text-xs text-muted-foreground mb-2">
                        By {upload.employee.firstName} {upload.employee.lastName} ({upload.employee.employeeId})
                      </p>
                      <p className="text-xs text-muted-foreground mb-2">Type: {upload.contentType}</p>
                      {upload.contentType.startsWith("image/") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={upload.data}
                          alt={upload.filename}
                          className="w-full h-32 object-cover rounded border"
                        />
                      ) : upload.contentType === "text/html" ? (
                        // INTENTIONALLY VULNERABLE: renders user-uploaded HTML inline.
                        <iframe
                          srcDoc={atob(upload.data.split(",")[1] || "")}
                          title={upload.filename}
                          className="w-full h-32 border rounded bg-white"
                          sandbox="allow-scripts"
                        />
                      ) : (
                        <a
                          href={upload.data}
                          download={upload.filename}
                          className="text-xs text-primary underline"
                        >
                          Download file
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
