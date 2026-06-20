import { PrismaClient, Role, LeadStatus, FollowUpStatus, PaymentStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Clean existing data
  await prisma.booking.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const adminPassword = await bcrypt.hash("admin123", 10);
  const salesPassword = await bcrypt.hash("sales123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@crm.com",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: "Sarah Johnson",
      email: "manager@crm.com",
      password: salesPassword,
      role: Role.MANAGER,
    },
  });

  const sales1 = await prisma.user.create({
    data: {
      name: "Mike Wilson",
      email: "mike@crm.com",
      password: salesPassword,
      role: Role.SALES,
    },
  });

  const sales2 = await prisma.user.create({
    data: {
      name: "Emily Davis",
      email: "emily@crm.com",
      password: salesPassword,
      role: Role.SALES,
    },
  });

  console.log("✅ Users created");

  // Create leads
  const leadsData = [
    {
      name: "Robert Chen",
      phone: "+1-555-0101",
      email: "robert.chen@email.com",
      source: "Website",
      status: LeadStatus.HOT,
      assignedTo: sales1.id,
      notes: "Interested in 3BHK apartment, budget 500K",
    },
    {
      name: "Maria Garcia",
      phone: "+1-555-0102",
      email: "maria.garcia@email.com",
      source: "Referral",
      status: LeadStatus.WARM,
      assignedTo: sales1.id,
      notes: "Looking for commercial space",
    },
    {
      name: "James Thompson",
      phone: "+1-555-0103",
      email: "james.t@email.com",
      source: "Social Media",
      status: LeadStatus.COLD,
      assignedTo: sales2.id,
      notes: "Just browsing options",
    },
    {
      name: "Priya Patel",
      phone: "+1-555-0104",
      email: "priya.patel@email.com",
      source: "Website",
      status: LeadStatus.HOT,
      assignedTo: sales2.id,
      notes: "Ready to buy, needs quick response",
    },
    {
      name: "David Lee",
      phone: "+1-555-0105",
      email: "david.lee@email.com",
      source: "Email Campaign",
      status: LeadStatus.WARM,
      assignedTo: sales1.id,
      notes: "Interested in investment property",
    },
    {
      name: "Jennifer Adams",
      phone: "+1-555-0106",
      email: "jennifer.a@email.com",
      source: "Referral",
      status: LeadStatus.COLD,
      assignedTo: sales2.id,
      notes: "First-time buyer, needs guidance",
    },
    {
      name: "Michael Brown",
      phone: "+1-555-0107",
      email: "michael.b@email.com",
      source: "Walk-in",
      status: LeadStatus.CONVERTED,
      assignedTo: sales1.id,
      notes: "Converted successfully",
    },
    {
      name: "Lisa Martinez",
      phone: "+1-555-0108",
      email: "lisa.m@email.com",
      source: "Website",
      status: LeadStatus.LOST,
      assignedTo: sales2.id,
      notes: "Went with competitor",
    },
    {
      name: "Thomas Anderson",
      phone: "+1-555-0109",
      email: "thomas.a@email.com",
      source: "Social Media",
      status: LeadStatus.WARM,
      assignedTo: manager.id,
      notes: "High-value prospect",
    },
    {
      name: "Sophie Turner",
      phone: "+1-555-0110",
      email: "sophie.t@email.com",
      source: "Email Campaign",
      status: LeadStatus.HOT,
      assignedTo: manager.id,
      notes: "VIP client, handle with care",
    },
  ];

  const leads = await Promise.all(
    leadsData.map((lead) => prisma.lead.create({ data: lead }))
  );

  console.log("✅ Leads created");

  // Create follow-ups
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  await prisma.followUp.createMany({
    data: [
      {
        leadId: leads[0].id,
        followUpDate: today,
        notes: "Call to discuss property options",
        status: FollowUpStatus.PENDING,
      },
      {
        leadId: leads[1].id,
        followUpDate: tomorrow,
        notes: "Schedule site visit",
        status: FollowUpStatus.PENDING,
      },
      {
        leadId: leads[2].id,
        followUpDate: yesterday,
        notes: "Send brochure",
        status: FollowUpStatus.COMPLETED,
      },
      {
        leadId: leads[3].id,
        followUpDate: today,
        notes: "Finalize deal terms",
        status: FollowUpStatus.PENDING,
      },
      {
        leadId: leads[4].id,
        followUpDate: nextWeek,
        notes: "Follow up after property visit",
        status: FollowUpStatus.PENDING,
      },
    ],
  });

  console.log("✅ Follow-ups created");

  // Create customers from converted leads
  const customer1 = await prisma.customer.create({
    data: {
      leadId: leads[6].id,
      name: leads[6].name,
      phone: leads[6].phone,
      email: leads[6].email,
    },
  });

  const convertedLead = leads[9];
  await prisma.lead.update({
    where: { id: convertedLead.id },
    data: { status: LeadStatus.CONVERTED },
  });

  const customer2 = await prisma.customer.create({
    data: {
      leadId: convertedLead.id,
      name: convertedLead.name,
      phone: convertedLead.phone,
      email: convertedLead.email,
    },
  });

  console.log("✅ Customers created");

  // Create bookings
  await prisma.booking.createMany({
    data: [
      {
        customerId: customer1.id,
        propertyName: "Skyline Towers - Unit 4B",
        amount: 485000,
        paymentStatus: PaymentStatus.PAID,
        bookingDate: new Date("2024-11-15"),
      },
      {
        customerId: customer1.id,
        propertyName: "Green Valley - Plot 12",
        amount: 125000,
        paymentStatus: PaymentStatus.PARTIAL,
        bookingDate: new Date("2024-12-01"),
      },
      {
        customerId: customer2.id,
        propertyName: "Harbor View - Penthouse",
        amount: 950000,
        paymentStatus: PaymentStatus.PENDING,
        bookingDate: new Date("2025-01-10"),
      },
    ],
  });

  console.log("✅ Bookings created");
  console.log("");
  console.log("🎉 Seed completed successfully!");
  console.log("");
  console.log("📋 Login credentials:");
  console.log("  Admin:   admin@crm.com / admin123");
  console.log("  Manager: manager@crm.com / sales123");
  console.log("  Sales:   mike@crm.com / sales123");
  console.log("  Sales:   emily@crm.com / sales123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
