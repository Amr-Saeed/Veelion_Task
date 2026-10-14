import { NextResponse } from "next/server";
import { BackendApiError, getTasksFromBackend } from "@/lib/backendApi";

export async function GET() {
  try {
    const tasks = await getTasksFromBackend();
    return NextResponse.json({ data: tasks }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: { message: error instanceof Error ? error.message : "Unable to fetch tasks." } },
      { status: error instanceof BackendApiError ? error.status : 500 }
    );
  }
}
