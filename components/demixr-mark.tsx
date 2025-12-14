import { cn } from "@/lib/utils";

export function DemixrMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("text-white", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M32 8.5c13 0 23.5 10.5 23.5 23.5S45 55.5 32 55.5 8.5 45 8.5 32 19 8.5 32 8.5Z"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M38.5 18.5v25.2c0 3.7-3.6 6.9-8.1 6.9-4.1 0-7.4-2.6-7.4-5.9 0-3.3 3.3-5.9 7.4-5.9 2.2 0 4.2.7 5.5 1.8V22.4l14-4.5v18.9"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M44.2 36.6c1.8 1.6 2.9 3.8 2.9 6.2 0 4.8-4.4 8.7-9.9 8.7"
        stroke="currentColor"
        strokeOpacity="0.6"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M46.1 29.6c1.5 1.3 2.4 3.1 2.4 5.1 0 3.9-3.6 7-8.1 7"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
