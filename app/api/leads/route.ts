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
  const search = searchParams.get("search");
  const limit = parseInt(searchParams.get("limit") || "100");

  const where: Record<string, unknown> = {};

  if (status && status !== "ALL") {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const leads = await prisma.lead.findMany({
    where,
    include: {
      assignedUser: {
        select: { id: true, name: true, email: true, role: true },
      },
      _count: {
        select: { followUps: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json(leads);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, phone, email, source, status, assignedTo, notes } = body;

  if (!name || !phone || !source) {
    return NextResponse.json(
      { error: "Name, phone, and source are required" },
      { status: 400 }
    );
  }

  const lead = await prisma.lead.create({
    data: {
      name,
      phone,
      email: email || null,
      source,
      status: status || "COLD",
      assignedTo: assignedTo || null,
      notes: notes || null,
    },
    include: {
      assignedUser: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
  });

  return NextResponse.json(lead, { status: 201 });
}
