import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const leadId = searchParams.get("leadId");
  const today = searchParams.get("today");

  const where: Record<string, unknown> = {};

  if (status && status !== "ALL") {
    where.status = status;
  }

  if (leadId) {
    where.leadId = leadId;
  }

  if (today === "true") {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    where.followUpDate = { gte: start, lte: end };
  }

  const followUps = await prisma.followUp.findMany({
    where,
    include: {
      lead: {
        select: { id: true, name: true, phone: true, status: true },
      },
    },
    orderBy: { followUpDate: "asc" },
  });

  return NextResponse.json(followUps);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { leadId, followUpDate, notes, status } = body;

  if (!leadId || !followUpDate) {
    return NextResponse.json(
      { error: "Lead ID and follow-up date are required" },
      { status: 400 }
    );
  }

  const followUp = await prisma.followUp.create({
    data: {
      leadId,
      followUpDate: new Date(followUpDate),
      notes: notes || null,
      status: status || "PENDING",
    },
    include: {
      lead: {
        select: { id: true, name: true, phone: true, status: true },
      },
    },
  });

  return NextResponse.json(followUp, { status: 201 });
}
