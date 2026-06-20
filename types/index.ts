export type Role = "ADMIN" | "MANAGER" | "SALES";
export type LeadStatus = "HOT" | "WARM" | "COLD" | "CONVERTED" | "LOST";
export type FollowUpStatus = "PENDING" | "COMPLETED" | "MISSED";
export type PaymentStatus = "PENDING" | "PARTIAL" | "PAID";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  source: string;
  status: LeadStatus;
  assignedTo?: string | null;
  assignedUser?: User | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  followUps?: FollowUp[];
  customer?: Customer | null;
}

export interface FollowUp {
  id: string;
  leadId: string;
  lead?: Lead;
  followUpDate: Date;
  notes?: string | null;
  status: FollowUpStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  leadId: string;
  lead?: Lead;
  name: string;
  phone: string;
  email?: string | null;
  createdAt: Date;
  bookings?: Booking[];
}

export interface Booking {
  id: string;
  customerId: string;
  customer?: Customer;
  propertyName: string;
  amount: number;
  paymentStatus: PaymentStatus;
  bookingDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalLeads: number;
  newLeadsToday: number;
  followUpsToday: number;
  totalCustomers: number;
  totalRevenue: number;
  leadsByStatus: {
    status: LeadStatus;
    count: number;
  }[];
}

export interface ReportData {
  leadsByStatus: { status: string; count: number }[];
  dailyLeads: { date: string; count: number }[];
  conversionRate: number;
  totalRevenue: number;
  revenueByMonth: { month: string; revenue: number }[];
}
