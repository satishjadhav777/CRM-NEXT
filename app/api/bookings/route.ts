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
  const paymentStatus = searchParams.get("paymentStatus");

  const where: Record<string, unknown> = {};
  if (paymentStatus && paymentStatus !== "ALL") {
    where.paymentStatus = paymentStatus;
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      customer: {
        select: { id: true, name: true, phone: true, email: true },
      },
    },
    orderBy: { bookingDate: "desc" },
  });

  return NextResponse.json(bookings);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { customerId, propertyName, amount, paymentStatus, bookingDate } = body;

  if (!customerId || !propertyName || !amount || !bookingDate) {
    return NextResponse.json(
      { error: "Customer, property name, amount, and booking date are required" },
      { status: 400 }
    );
  }

  const booking = await prisma.booking.create({
    data: {
      customerId,
      propertyName,
      amount: parseFloat(amount),
      paymentStatus: paymentStatus || "PENDING",
      bookingDate: new Date(bookingDate),
    },
    include: {
      customer: {
        select: { id: true, name: true, phone: true },
      },
    },
  });

  return NextResponse.json(booking, { status: 201 });
}
