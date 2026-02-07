import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function getDomainColor(domain: string): string {
  const colors: Record<string, string> = {
    Technology: 'bg-blue-500',
    Marketing: 'bg-purple-500',
    Sales: 'bg-green-500',
    HR: 'bg-pink-500',
    Finance: 'bg-yellow-500',
    'Data Science': 'bg-indigo-500',
    Custom: 'bg-gray-500',
  };
  return colors[domain] || 'bg-gray-500';
}
