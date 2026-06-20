"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { formatDate, isToday, isPast, cn } from "@/lib/utils";
import { FollowUp } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { CheckCircle2, Clock, XCircle, Trash2 } from "lucide-react";

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchFollowUps = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    const res = await fetch(`/api/follow-ups?${params}`);
    const data = await res.json();
    setFollowUps(data);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    fetchFollowUps();
  }, [fetchFollowUps]);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/follow-ups/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    toast({ title: "Follow-up updated" });
    fetchFollowUps();
  };

  const deleteFollowUp = async (id: string) => {
    if (!confirm("Delete this follow-up?")) return;
    await fetch(`/api/follow-ups/${id}`, { method: "DELETE" });
    toast({ title: "Follow-up deleted" });
    fetchFollowUps();
  };

  const statusConfig = {
    PENDING: { label: "Pending", icon: Clock, color: "text-yellow-600" },
    COMPLETED: { label: "Completed", icon: CheckCircle2, color: "text-green-600" },
    MISSED: { label: "Missed", icon: XCircle, color: "text-red-600" },
  };

  const todayFollowUps = followUps.filter(
    (f) => isToday(f.followUpDate) && f.status === "PENDING"
  );
  const otherFollowUps = followUps.filter(
    (f) => !(isToday(f.followUpDate) && f.status === "PENDING")
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Follow-ups</h2>
          <p className="text-sm text-gray-500">
            {followUps.length} total · {todayFollowUps.length} due today
          </p>
        </div>
        <Link href="/follow-ups/add">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Schedule Follow-up
          </Button>
        </Link>
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <Filter className="h-4 w-4 mr-2 text-gray-400" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="MISSED">Missed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <PageLoader />
      ) : (
        <div className="space-y-6">
          {/* Today's follow-ups */}
          {todayFollowUps.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wider mb-3">
                📅 Today — {todayFollowUps.length} due
              </h3>
              <div className="space-y-2">
                {todayFollowUps.map((fu) => (
                  <FollowUpRow
                    key={fu.id}
                    followUp={fu}
                    onStatusChange={updateStatus}
                    onDelete={deleteFollowUp}
                    isToday
                  />
                ))}
              </div>
            </div>
          )}

          {/* Other follow-ups */}
          {otherFollowUps.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                All Follow-ups
              </h3>
              <div className="space-y-2">
                {otherFollowUps.map((fu) => (
                  <FollowUpRow
                    key={fu.id}
                    followUp={fu}
                    onStatusChange={updateStatus}
                    onDelete={deleteFollowUp}
                  />
                ))}
              </div>
            </div>
          )}

          {followUps.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
              <Clock className="h-10 w-10 text-gray-300" />
              <h3 className="mt-3 text-sm font-semibold text-gray-700">
                No follow-ups
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Schedule your first follow-up
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FollowUpRow({
  followUp,
  onStatusChange,
  onDelete,
  isToday: today,
}: {
  followUp: FollowUp;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  isToday?: boolean;
}) {
  const overdue = isPast(followUp.followUpDate) && followUp.status === "PENDING" && !today;

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-lg border p-4",
        today ? "border-blue-200 bg-blue-50" : overdue ? "border-red-100 bg-red-50/50" : "bg-white"
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link
            href={`/leads/${followUp.leadId}`}
            className="text-sm font-semibold text-gray-900 hover:text-blue-600 truncate"
          >
            {followUp.lead?.name || "Unknown Lead"}
          </Link>
          {today && (
            <span className="shrink-0 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
              Today
            </span>
          )}
          {overdue && (
            <span className="shrink-0 rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
              Overdue
            </span>
          )}
        </div>
        {followUp.notes && (
          <p className="mt-0.5 text-sm text-gray-600 truncate">{followUp.notes}</p>
        )}
        <p className="mt-0.5 text-xs text-gray-400">
          {formatDate(followUp.followUpDate)}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {followUp.status === "PENDING" && (
          <>
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1 text-green-700 border-green-200 hover:bg-green-50"
              onClick={() => onStatusChange(followUp.id, "COMPLETED")}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Done
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1 text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => onStatusChange(followUp.id, "MISSED")}
            >
              <XCircle className="h-3.5 w-3.5" />
              Miss
            </Button>
          </>
        )}
        {followUp.status !== "PENDING" && (
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-semibold",
              followUp.status === "COMPLETED"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            )}
          >
            {followUp.status}
          </span>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"
          onClick={() => onDelete(followUp.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
