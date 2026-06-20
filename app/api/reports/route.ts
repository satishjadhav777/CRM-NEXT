import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Leads by status
  const leadsByStatus = await prisma.lead.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  // Daily leads for last 14 days
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const recentLeads = await prisma.lead.findMany({
    where: { createdAt: { gte: fourteenDaysAgo } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  // Group by date
  const dailyMap = new Map<string, number>();
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    dailyMap.set(key, 0);
  }
  for (const lead of recentLeads) {
    const key = new Date(lead.createdAt).toISOString().split("T")[0];
    if (dailyMap.has(key)) {
      dailyMap.set(key, (dailyMap.get(key) || 0) + 1);
    }
  }
  const dailyLeads = Array.from(dailyMap.entries()).map(([date, count]) => ({
    date,
    count,
  }));

  // Total revenue
  const revenueResult = await prisma.booking.aggregate({
    _sum: { amount: true },
  });
  const totalRevenue = revenueResult._sum.amount || 0;

  // Conversion rate
  const totalLeads = await prisma.lead.count();
  const convertedLeads = await prisma.lead.count({
    where: { status: "CONVERTED" },
  });
  const conversionRate =
    totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  // Revenue by month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const bookings = await prisma.booking.findMany({
    where: { bookingDate: { gte: sixMonthsAgo } },
    select: { amount: true, bookingDate: true },
  });

  const monthMap = new Map<string, number>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.toLocaleString("en-US", { month: "short", year: "2-digit" });
    monthMap.set(key, 0);
  }
  for (const booking of bookings) {
    const key = new Date(booking.bookingDate).toLocaleString("en-US", {
      month: "short",
      year: "2-digit",
    });
    if (monthMap.has(key)) {
      monthMap.set(key, (monthMap.get(key) || 0) + booking.amount);
    }
  }
  const revenueByMonth = Array.from(monthMap.entries()).map(
    ([month, revenue]) => ({ month, revenue })
  );

  return NextResponse.json({
    leadsByStatus: leadsByStatus.map((l) => ({
      status: l.status,
      count: l._count.id,
    })),
    dailyLeads,
    conversionRate,
    totalRevenue,
    revenueByMonth,
  });
}
