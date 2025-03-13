import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { redirect } from "next/navigation";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function encodedRedirect(
  type: "error" | "success",
  path: string,
  message: string
) {
  const searchParams = new URLSearchParams();
  searchParams.set(type, message);
  return redirect(`${path}?${searchParams.toString()}`);
}