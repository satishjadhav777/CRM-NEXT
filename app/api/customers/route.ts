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
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const customers = await prisma.customer.findMany({
    where,
    include: {
      bookings: true,
      lead: {
        select: { id: true, source: true, status: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(customers);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { leadId, name, phone, email } = body;

  if (!leadId || !name || !phone) {
    return NextResponse.json(
      { error: "Lead ID, name, and phone are required" },
      { status: 400 }
    );
  }

  // Update lead status to CONVERTED
  await prisma.lead.update({
    where: { id: leadId },
    data: { status: "CONVERTED" },
  });

  const customer = await prisma.customer.create({
    data: {
      leadId,
      name,
      phone,
      email: email || null,
    },
    include: {
      bookings: true,
      lead: true,
    },
  });

  return NextResponse.json(customer, { status: 201 });
}
