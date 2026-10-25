import { cn } from "../../lib/cn";

export function Avatar({ name, size = "sm" }: { name: string; size?: "sm" | "lg" }) {
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700",
        size === "sm" ? "h-8 w-8 text-xs" : "h-16 w-16 text-xl",
      )}
      aria-hidden
    >
      {initials}
    </span>
  );
}
