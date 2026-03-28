import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseCost(amount: string | number): number {
  if (typeof amount === "string") {
    return parseFloat(amount.replace(/[^0-9.]/g, "")) || 0;
  }
  return isFinite(amount) ? amount : 0;
}

export function formatCurrency(amount: string | number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(parseCost(amount));
}
