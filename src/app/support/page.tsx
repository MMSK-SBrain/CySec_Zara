import { redirect } from "next/navigation";
import { getSessionEmployee } from "@/lib/auth";
import { Navigation } from "@/components/Navigation";
import { ZaraChat } from "@/components/ZaraChat";

export default async function SupportPage() {
  const employee = await getSessionEmployee();
  if (!employee) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      <Navigation employee={employee} />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto h-full">
          <ZaraChat employee={employee} />
        </div>
      </main>
    </div>
  );
}
