import { BACKEND_BASE_URL } from "@/lib/constants";
import type {
  ActivityLog,
  ErrorResponse,
  Task,
  TaskResponse,
  TasksResponse,
  TasksSummary,
} from "@/types/api";

export class BackendApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "BackendApiError";
    this.status = status;
  }
}

function buildBackendUrl(path: string): string {
  return `${BACKEND_BASE_URL}${path}`;
}

async function parseError(response: Response): Promise<BackendApiError> {
  let fallback = `Request failed with status ${response.status}`;

  try {
    const body = (await response.json()) as ErrorResponse;
    return new BackendApiError(body.error?.message || fallback, response.status);
  } catch {
    return new BackendApiError(fallback, response.status);
  }
}

export async function getTasksFromBackend(): Promise<Task[]> {
  try {
    const response = await fetch(buildBackendUrl("/tasks"), {
      cache: "no-store",
    });

    if (!response.ok) {
      throw await parseError(response);
    }

    const body = (await response.json()) as TasksResponse;
    return body.data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to load tasks.");
  }
}

export async function updateTaskInBackend(taskId: string, completed: boolean): Promise<Task> {
  try {
    const response = await fetch(buildBackendUrl(`/tasks/${taskId}`), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ completed }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw await parseError(response);
    }

    const body = (await response.json()) as TaskResponse;
    return body.data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to update task.");
  }
}

export async function getActivityFromBackend(): Promise<ActivityLog[]> {
  try {
    const response = await fetch(buildBackendUrl("/activity"), {
      cache: "no-store",
    });

    if (!response.ok) {
      throw await parseError(response);
    }

    return (await response.json()) as ActivityLog[];
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to load activity logs.");
  }
}

export async function getTasksSummaryFromBackend(): Promise<TasksSummary> {
  try {
    const response = await fetch(buildBackendUrl("/reports/tasks-summary"), {
      cache: "no-store",
    });

    if (!response.ok) {
      throw await parseError(response);
    }

    return (await response.json()) as TasksSummary;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to load task summary.");
  }
}
