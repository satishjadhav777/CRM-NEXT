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

  const followUp = await prisma.followUp.findUnique({
    where: { id: params.id },
    include: {
      lead: true,
    },
  });

  if (!followUp) {
    return NextResponse.json({ error: "Follow-up not found" }, { status: 404 });
  }

  return NextResponse.json(followUp);
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
  const { leadId, followUpDate, notes, status } = body;

  const followUp = await prisma.followUp.update({
    where: { id: params.id },
    data: {
      leadId,
      followUpDate: followUpDate ? new Date(followUpDate) : undefined,
      notes: notes || null,
      status,
    },
    include: {
      lead: {
        select: { id: true, name: true, phone: true, status: true },
      },
    },
  });

  return NextResponse.json(followUp);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.followUp.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
