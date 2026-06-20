import Link from "next/link";
import { Customer } from "@/types";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Mail, Phone, Calendar, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CustomerCardProps {
  customer: Customer;
}

export function CustomerCard({ customer }: CustomerCardProps) {
  const totalRevenue =
    customer.bookings?.reduce((sum, b) => sum + b.amount, 0) || 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{customer.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Customer since {formatDate(customer.createdAt)}
            </p>
          </div>
          <Link href={`/customers/${customer.id}`}>
            <Button variant="outline" size="sm">
              View
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Phone className="h-3.5 w-3.5 text-gray-400" />
            {customer.phone}
          </div>
          {customer.email && (
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="h-3.5 w-3.5 text-gray-400" />
              {customer.email}
            </div>
          )}
          {customer.bookings !== undefined && (
            <div className="flex items-center gap-2 text-gray-600">
              <BookOpen className="h-3.5 w-3.5 text-gray-400" />
              {customer.bookings.length} booking{customer.bookings.length !== 1 ? "s" : ""}
            </div>
          )}
          {totalRevenue > 0 && (
            <div className="mt-3 rounded-md bg-green-50 px-3 py-2">
              <p className="text-xs text-green-600 font-medium">Total Revenue</p>
              <p className="text-sm font-bold text-green-700">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
