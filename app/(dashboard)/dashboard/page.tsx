"use client";

import { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  CalendarClock,
  UserCheck,
  DollarSign,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentLeads } from "@/components/dashboard/RecentLeads";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadStatusBadge } from "@/components/leads/LeadStatusBadge";
import { formatCurrency } from "@/lib/utils";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { Lead, LeadStatus } from "@/types";

interface DashboardData {
  totalLeads: number;
  newLeadsToday: number;
  followUpsToday: number;
  totalCustomers: number;
  totalRevenue: number;
  leadsByStatus: { status: LeadStatus; count: number }[];
  recentLeads: Lead[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatsCard
          title="Total Leads"
          value={data?.totalLeads || 0}
          icon={Users}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatsCard
          title="New Today"
          value={data?.newLeadsToday || 0}
          icon={UserPlus}
          iconColor="text-green-600"
          iconBg="bg-green-50"
          description="leads added today"
        />
        <StatsCard
          title="Follow-ups Today"
          value={data?.followUpsToday || 0}
          icon={CalendarClock}
          iconColor="text-orange-600"
          iconBg="bg-orange-50"
          description="pending today"
        />
        <StatsCard
          title="Customers"
          value={data?.totalCustomers || 0}
          icon={UserCheck}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
        <StatsCard
          title="Revenue"
          value={formatCurrency(data?.totalRevenue || 0)}
          icon={DollarSign}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          description="total collected"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Leads */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent Leads</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.recentLeads && data.recentLeads.length > 0 ? (
              <RecentLeads leads={data.recentLeads} />
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">
                No leads yet. Add your first lead!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Leads by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Leads by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.leadsByStatus && data.leadsByStatus.length > 0 ? (
                data.leadsByStatus.map(({ status, count }) => (
                  <div key={status} className="flex items-center justify-between">
                    <LeadStatusBadge status={status} />
                    <div className="flex items-center gap-2">
                      <div className="h-2 rounded-full bg-gray-100 w-20 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{
                            width: `${Math.min(
                              (count / (data?.totalLeads || 1)) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 w-5 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
