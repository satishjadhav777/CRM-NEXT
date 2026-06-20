import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [
    totalLeads,
    newLeadsToday,
    followUpsToday,
    totalCustomers,
    revenueResult,
    leadsByStatus,
    recentLeads,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({
      where: { createdAt: { gte: today, lte: todayEnd } },
    }),
    prisma.followUp.count({
      where: {
        followUpDate: { gte: today, lte: todayEnd },
        status: "PENDING",
      },
    }),
    prisma.customer.count(),
    prisma.booking.aggregate({
      _sum: { amount: true },
      where: { paymentStatus: { in: ["PAID", "PARTIAL"] } },
    }),
    prisma.lead.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    prisma.lead.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        assignedUser: {
          select: { id: true, name: true },
        },
      },
    }),
  ]);

  return NextResponse.json({
    totalLeads,
    newLeadsToday,
    followUpsToday,
    totalCustomers,
    totalRevenue: revenueResult._sum.amount || 0,
    leadsByStatus: leadsByStatus.map((l) => ({
      status: l.status,
      count: l._count.id,
    })),
    recentLeads,
  });
}
