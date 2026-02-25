import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { AxiosError } from "axios";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Get user-facing error message from API error (backend sends { message }). */
export function getErrorMessage(err: unknown): string {
  const ax = err as AxiosError<{ message?: string }>;
  const msg = ax.response?.data?.message;
  if (typeof msg === "string" && msg.trim()) return msg;
  return err instanceof Error ? err.message : "Something went wrong";
}
