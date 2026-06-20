import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    include: {
      assignedUser: {
        select: { id: true, name: true, email: true, role: true },
      },
      followUps: {
        orderBy: { followUpDate: "desc" },
      },
      customer: true,
    },
  });

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  return NextResponse.json(lead);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, phone, email, source, status, assignedTo, notes } = body;

  const lead = await prisma.lead.update({
    where: { id: params.id },
    data: {
      name,
      phone,
      email: email || null,
      source,
      status,
      assignedTo: assignedTo || null,
      notes: notes || null,
    },
    include: {
      assignedUser: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
  });

  return NextResponse.json(lead);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.lead.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
