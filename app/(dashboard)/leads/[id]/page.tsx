"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  User,
  Tag,
  Edit,
  UserPlus,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadStatusBadge } from "@/components/leads/LeadStatusBadge";
import { LeadForm } from "@/components/leads/LeadForm";
import { FollowUpList } from "@/components/follow-ups/FollowUpList";
import { FollowUpForm } from "@/components/follow-ups/FollowUpForm";
import { Modal } from "@/components/shared/Modal";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { formatDate } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Lead } from "@/types";

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditing = searchParams.get("edit") === "true";

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [converting, setConverting] = useState(false);

  const fetchLead = async () => {
    setLoading(true);
    const res = await fetch(`/api/leads/${id}`);
    if (res.ok) {
      const data = await res.json();
      setLead(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLead();
  }, [id]);

  const handleConvert = async () => {
    if (!lead) return;
    if (
      !confirm(
        `Convert "${lead.name}" to a customer? This will mark the lead as CONVERTED.`
      )
    )
      return;

    setConverting(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: lead.id,
          name: lead.name,
          phone: lead.phone,
          email: lead.email,
        }),
      });

      if (!res.ok) throw new Error("Failed to convert");

      toast({ title: "Lead converted to customer successfully!" });
      router.push("/customers");
    } catch {
      toast({
        title: "Failed to convert lead",
        variant: "destructive",
      });
    } finally {
      setConverting(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!lead) return <div className="text-center py-16 text-gray-500">Lead not found</div>;

  if (isEditing) {
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Link href={`/leads/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Lead</h2>
            <p className="text-sm text-gray-500">{lead.name}</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <LeadForm lead={lead} onSuccess={() => router.push(`/leads/${id}`)} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/leads">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">{lead.name}</h2>
              <LeadStatusBadge status={lead.status} />
            </div>
            <p className="text-sm text-gray-500">
              Added {formatDate(lead.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/leads/${id}?edit=true`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Edit className="h-3.5 w-3.5" />
              Edit
            </Button>
          </Link>
          {lead.status !== "CONVERTED" && lead.status !== "LOST" && !lead.customer && (
            <Button
              size="sm"
              className="gap-1.5 bg-green-600 hover:bg-green-700"
              onClick={handleConvert}
              disabled={converting}
            >
              <UserPlus className="h-3.5 w-3.5" />
              {converting ? "Converting..." : "Convert to Customer"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Lead Info */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{lead.phone}</span>
                </div>
                {lead.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{lead.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Tag className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">Source: {lead.source}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">
                    Assigned to:{" "}
                    {lead.assignedUser?.name || (
                      <span className="text-gray-400 italic">Unassigned</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">
                    Created {formatDate(lead.createdAt)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {lead.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {lead.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Follow-ups */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Follow-ups</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={() => setShowFollowUpModal(true)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <FollowUpList followUps={lead.followUps || []} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Follow-up Modal */}
      <Modal
        open={showFollowUpModal}
        onOpenChange={setShowFollowUpModal}
        title="Schedule Follow-up"
      >
        <FollowUpForm
          preselectedLeadId={id}
          onSuccess={() => {
            setShowFollowUpModal(false);
            fetchLead();
          }}
        />
      </Modal>
    </div>
  );
}
