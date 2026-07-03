import { redirect } from "next/navigation";
import { getSessionEmployee } from "@/lib/auth";
import { Navigation } from "@/components/Navigation";
import { PolicySearch } from "@/components/PolicySearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PoliciesPage() {
  const employee = await getSessionEmployee();
  if (!employee) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      <Navigation employee={employee} />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Company Policies</h1>

          <Card>
            <CardHeader>
              <CardTitle>Search Policies</CardTitle>
            </CardHeader>
            <CardContent>
              <PolicySearch />
              <p className="text-xs text-muted-foreground mt-4">
                Powered by a quick AI-generated search backend.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
