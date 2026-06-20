"use client";

import { FollowUp } from "@/types";
import { formatDate, isToday, isPast, cn } from "@/lib/utils";
import { Calendar, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FollowUpListProps {
  followUps: FollowUp[];
  showLead?: boolean;
}

const statusConfig = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    className: "bg-yellow-100 text-yellow-800",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-800",
  },
  MISSED: {
    label: "Missed",
    icon: XCircle,
    className: "bg-red-100 text-red-800",
  },
};

export function FollowUpList({ followUps, showLead = false }: FollowUpListProps) {
  if (followUps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center">
        <Calendar className="h-8 w-8 text-gray-300" />
        <p className="mt-2 text-sm text-gray-500">No follow-ups scheduled</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {followUps.map((fu) => {
        const config = statusConfig[fu.status];
        const Icon = config.icon;
        const today = isToday(fu.followUpDate);
        const overdue = isPast(fu.followUpDate) && fu.status === "PENDING";

        return (
          <div
            key={fu.id}
            className={cn(
              "flex items-start gap-3 rounded-lg border p-4 transition-colors",
              today && fu.status === "PENDING"
                ? "border-blue-200 bg-blue-50"
                : overdue
                ? "border-red-200 bg-red-50"
                : "bg-white hover:bg-gray-50"
            )}
          >
            <Icon
              className={cn(
                "mt-0.5 h-4 w-4 shrink-0",
                fu.status === "COMPLETED"
                  ? "text-green-600"
                  : overdue
                  ? "text-red-600"
                  : today
                  ? "text-blue-600"
                  : "text-yellow-600"
              )}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                    config.className
                  )}
                >
                  {config.label}
                </span>
                {today && fu.status === "PENDING" && (
                  <span className="inline-flex items-center rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
                    Today
                  </span>
                )}
                {overdue && (
                  <span className="inline-flex items-center rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
                    Overdue
                  </span>
                )}
              </div>
              {showLead && fu.lead && (
                <p className="mt-1 text-sm font-medium text-gray-800">
                  {fu.lead.name}
                </p>
              )}
              {fu.notes && (
                <p className="mt-1 text-sm text-gray-600">{fu.notes}</p>
              )}
              <p className="mt-1 text-xs text-gray-400">
                {formatDate(fu.followUpDate)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
