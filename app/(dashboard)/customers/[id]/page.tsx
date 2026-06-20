"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, Mail, Calendar, DollarSign, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Customer, Booking } from "@/types";
import { Modal } from "@/components/shared/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const paymentStatusConfig = {
  PENDING: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  PARTIAL: { label: "Partial", className: "bg-blue-100 text-blue-800" },
  PAID: { label: "Paid", className: "bg-green-100 text-green-800" },
};

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const [bookingForm, setBookingForm] = useState({
    propertyName: "",
    amount: "",
    paymentStatus: "PENDING",
    bookingDate: new Date().toISOString().split("T")[0],
  });

  const fetchCustomer = async () => {
    setLoading(true);
    const res = await fetch(`/api/customers/${id}`);
    if (res.ok) setCustomer(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...bookingForm, customerId: id }),
    });
    if (res.ok) {
      toast({ title: "Booking added successfully" });
      setShowBookingModal(false);
      fetchCustomer();
    }
  };

  if (loading) return <PageLoader />;
  if (!customer) return <div className="py-16 text-center text-gray-500">Customer not found</div>;

  const totalRevenue = customer.bookings?.reduce((s, b) => s + b.amount, 0) || 0;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/customers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{customer.name}</h2>
          <p className="text-sm text-gray-500">Customer since {formatDate(customer.createdAt)}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Contact</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />{customer.phone}
              </div>
              {customer.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />{customer.email}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                {formatDate(customer.createdAt)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Revenue</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(totalRevenue)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Bookings ({customer.bookings?.length || 0})
                </CardTitle>
                <Button size="sm" onClick={() => setShowBookingModal(true)} className="gap-1">
                  <Plus className="h-3.5 w-3.5" />
                  Add Booking
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {customer.bookings && customer.bookings.length > 0 ? (
                <div className="space-y-3">
                  {customer.bookings.map((booking: Booking) => {
                    const cfg = paymentStatusConfig[booking.paymentStatus];
                    return (
                      <div key={booking.id} className="flex items-start justify-between rounded-lg border p-4">
                        <div>
                          <p className="font-medium text-gray-900">{booking.propertyName}</p>
                          <p className="text-sm text-gray-500">{formatDate(booking.bookingDate)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(booking.amount)}</p>
                          <span className={cn("mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold", cfg.className)}>
                            {cfg.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-gray-500">No bookings yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal open={showBookingModal} onOpenChange={setShowBookingModal} title="Add Booking">
        <form onSubmit={handleAddBooking} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Property Name</Label>
            <Input
              required
              value={bookingForm.propertyName}
              onChange={(e) => setBookingForm({ ...bookingForm, propertyName: e.target.value })}
              placeholder="e.g. Skyline Tower Unit 4B"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Amount ($)</Label>
            <Input
              required
              type="number"
              min="0"
              step="0.01"
              value={bookingForm.amount}
              onChange={(e) => setBookingForm({ ...bookingForm, amount: e.target.value })}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Booking Date</Label>
            <Input
              required
              type="date"
              value={bookingForm.bookingDate}
              onChange={(e) => setBookingForm({ ...bookingForm, bookingDate: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Payment Status</Label>
            <Select value={bookingForm.paymentStatus} onValueChange={(v) => setBookingForm({ ...bookingForm, paymentStatus: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PARTIAL">Partial</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit">Add Booking</Button>
            <Button type="button" variant="outline" onClick={() => setShowBookingModal(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
