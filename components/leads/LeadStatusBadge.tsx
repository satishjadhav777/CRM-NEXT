import { LeadStatus } from "@/types";
import { cn } from "@/lib/utils";

interface LeadStatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  HOT: {
    label: "Hot",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  WARM: {
    label: "Warm",
    className: "bg-orange-100 text-orange-800 border-orange-200",
  },
  COLD: {
    label: "Cold",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  CONVERTED: {
    label: "Converted",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  LOST: {
    label: "Lost",
    className: "bg-gray-100 text-gray-600 border-gray-200",
  },
};

export function LeadStatusBadge({ status, className }: LeadStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
