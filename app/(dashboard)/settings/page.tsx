"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Settings, Building2, Tag, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

const DEFAULT_LEAD_SOURCES = [
  "Website",
  "Referral",
  "Social Media",
  "Email Campaign",
  "Walk-in",
  "Cold Call",
  "Event",
  "Other",
];

export default function SettingsPage() {
  const { data: session } = useSession();
  const [companyName, setCompanyName] = useState("CRM Pro");
  const [companyEmail, setCompanyEmail] = useState("contact@company.com");
  const [companyPhone, setCompanyPhone] = useState("+1-555-0000");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    toast({ title: "Settings saved successfully" });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500">Manage your CRM configuration</p>
      </div>

      {/* Company Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-gray-400" />
            <div>
              <CardTitle className="text-base">Company Details</CardTitle>
              <CardDescription>Basic company information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Company Name</Label>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Your Company Name"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Company Email</Label>
            <Input
              type="email"
              value={companyEmail}
              onChange={(e) => setCompanyEmail(e.target.value)}
              placeholder="contact@company.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Company Phone</Label>
            <Input
              value={companyPhone}
              onChange={(e) => setCompanyPhone(e.target.value)}
              placeholder="+1-555-0000"
            />
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Lead Sources */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-gray-400" />
            <div>
              <CardTitle className="text-base">Lead Sources</CardTitle>
              <CardDescription>Configured lead acquisition channels</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_LEAD_SOURCES.map((src) => (
              <span
                key={src}
                className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
              >
                {src}
              </span>
            ))}
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Lead sources are configured in the system. Contact your administrator to modify them.
          </p>
        </CardContent>
      </Card>

      {/* Lead Statuses */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-400" />
            <div>
              <CardTitle className="text-base">Lead Statuses</CardTitle>
              <CardDescription>Pipeline stages</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { status: "HOT", color: "bg-red-100 text-red-800", desc: "High priority, ready to buy" },
              { status: "WARM", color: "bg-orange-100 text-orange-800", desc: "Interested, needs nurturing" },
              { status: "COLD", color: "bg-blue-100 text-blue-800", desc: "Just enquired, early stage" },
              { status: "CONVERTED", color: "bg-green-100 text-green-800", desc: "Became a customer" },
              { status: "LOST", color: "bg-gray-100 text-gray-600", desc: "Closed, not converted" },
            ].map(({ status, color, desc }) => (
              <div key={status} className="flex items-center gap-3">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold w-24 text-center ${color}`}>
                  {status}
                </span>
                <span className="text-sm text-gray-600">{desc}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Name</span>
            <span className="font-medium">{session?.user?.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Email</span>
            <span className="font-medium">{session?.user?.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Role</span>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
              {(session?.user as any)?.role}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
