"use client";

import { useEffect, useState, useCallback } from "react";
import { Filter, BookOpen } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { formatDate, formatCurrency, cn } from "@/lib/utils";
import { Booking } from "@/types";
import Link from "next/link";

const paymentConfig = {
  PENDING: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  PARTIAL: { label: "Partial", className: "bg-blue-100 text-blue-800" },
  PAID: { label: "Paid", className: "bg-green-100 text-green-800" },
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "ALL") params.set("paymentStatus", statusFilter);
    const res = await fetch(`/api/bookings?${params}`);
    const data = await res.json();
    setBookings(data);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const totalRevenue = bookings.reduce((s, b) => s + b.amount, 0);
  const paidRevenue = bookings
    .filter((b) => b.paymentStatus === "PAID")
    .reduce((s, b) => s + b.amount, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Bookings</h2>
        <p className="text-sm text-gray-500">{bookings.length} booking{bookings.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs text-gray-500">Total Value</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs text-gray-500">Collected</p>
          <p className="text-xl font-bold text-green-700">{formatCurrency(paidRevenue)}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-xl font-bold text-yellow-700">
            {formatCurrency(totalRevenue - paidRevenue)}
          </p>
        </div>
      </div>

      {/* Filter */}
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-44">
          <Filter className="h-4 w-4 mr-2 text-gray-400" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Statuses</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="PARTIAL">Partial</SelectItem>
          <SelectItem value="PAID">Paid</SelectItem>
        </SelectContent>
      </Select>

      {loading ? (
        <PageLoader />
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <BookOpen className="h-10 w-10 text-gray-300" />
          <h3 className="mt-3 text-sm font-semibold text-gray-700">No bookings</h3>
          <p className="mt-1 text-sm text-gray-500">
            Bookings will appear here when customers book properties
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Property</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Payment</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Booking Date</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking, idx) => {
                const cfg = paymentConfig[booking.paymentStatus];
                return (
                  <tr key={booking.id} className={cn("border-b hover:bg-gray-50", idx % 2 === 0 ? "bg-white" : "bg-gray-50/30")}>
                    <td className="px-4 py-3">
                      <Link href={`/customers/${booking.customerId}`} className="font-medium text-gray-900 hover:text-blue-600">
                        {booking.customer?.name}
                      </Link>
                      <p className="text-xs text-gray-500">{booking.customer?.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{booking.propertyName}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(booking.amount)}</td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", cfg.className)}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(booking.bookingDate)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
