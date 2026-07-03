import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionEmployee } from "@/lib/auth";

// INTENTIONALLY VULNERABLE: accepts any file type including HTML/JS.
// Uploaded files are rendered in the admin panel without sanitization (XSS vector).
export async function POST(req: NextRequest) {
  try {
    const sessionEmployee = await getSessionEmployee();
    if (!sessionEmployee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { filename, contentType, data } = await req.json();

    if (!filename || !data) {
      return NextResponse.json({ error: "Missing file data" }, { status: 400 });
    }

    // No validation on contentType or file extension.
    const upload = await prisma.uploadedFile.create({
      data: {
        employeeId: sessionEmployee.id,
        filename,
        contentType: contentType || "application/octet-stream",
        data,
        purpose: "ATTENDANCE_PROOF",
      },
    });

    return NextResponse.json({ message: "Uploaded", upload });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
