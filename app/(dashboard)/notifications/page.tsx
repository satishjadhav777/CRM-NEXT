"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Calendar, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { formatDate, isToday, isPast, cn } from "@/lib/utils";
import { FollowUp } from "@/types";

export default function NotificationsPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/follow-ups?status=PENDING")
      .then((r) => r.json())
      .then((data) => {
        setFollowUps(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const todayFollowUps = followUps.filter((f) => isToday(f.followUpDate));
  const overdueFollowUps = followUps.filter(
    (f) => isPast(f.followUpDate) && !isToday(f.followUpDate)
  );
  const upcomingFollowUps = followUps.filter(
    (f) => !isPast(f.followUpDate) && !isToday(f.followUpDate)
  );

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
        <p className="text-sm text-gray-500">
          {followUps.length} pending follow-ups
        </p>
      </div>

      {/* Overdue */}
      {overdueFollowUps.length > 0 && (
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-base text-red-700">
                Overdue ({overdueFollowUps.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overdueFollowUps.map((fu) => (
                <NotificationItem key={fu.id} followUp={fu} type="overdue" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today */}
      {todayFollowUps.length > 0 && (
        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-base text-blue-700">
                Due Today ({todayFollowUps.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {todayFollowUps.map((fu) => (
                <NotificationItem key={fu.id} followUp={fu} type="today" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming */}
      {upcomingFollowUps.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-gray-500" />
              <CardTitle className="text-base">
                Upcoming ({upcomingFollowUps.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingFollowUps.slice(0, 10).map((fu) => (
                <NotificationItem key={fu.id} followUp={fu} type="upcoming" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {followUps.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <CheckCircle2 className="h-10 w-10 text-green-400" />
          <h3 className="mt-3 font-semibold text-gray-700">All caught up!</h3>
          <p className="mt-1 text-sm text-gray-500">No pending follow-ups</p>
        </div>
      )}
    </div>
  );
}

function NotificationItem({
  followUp,
  type,
}: {
  followUp: FollowUp;
  type: "today" | "overdue" | "upcoming";
}) {
  return (
    <Link href={`/leads/${followUp.leadId}`}>
      <div
        className={cn(
          "flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50",
          type === "overdue" && "bg-red-50/50",
          type === "today" && "bg-blue-50/50"
        )}
      >
        <div
          className={cn(
            "mt-0.5 flex h-2 w-2 shrink-0 rounded-full",
            type === "overdue" ? "bg-red-500" : type === "today" ? "bg-blue-500" : "bg-gray-400"
          )}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">
            {followUp.lead?.name || "Lead"}
          </p>
          {followUp.notes && (
            <p className="text-xs text-gray-500 truncate">{followUp.notes}</p>
          )}
          <p
            className={cn(
              "text-xs",
              type === "overdue" ? "text-red-600 font-medium" : "text-gray-400"
            )}
          >
            {type === "overdue" ? "⚠ Overdue — " : ""}
            {formatDate(followUp.followUpDate)}
          </p>
        </div>
      </div>
    </Link>
  );
}
