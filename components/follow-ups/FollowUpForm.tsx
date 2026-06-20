"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Lead, FollowUp } from "@/types";

interface FollowUpFormProps {
  followUp?: Partial<FollowUp>;
  preselectedLeadId?: string;
  onSuccess?: () => void;
}

export function FollowUpForm({ followUp, preselectedLeadId, onSuccess }: FollowUpFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);

  const [formData, setFormData] = useState({
    leadId: followUp?.leadId || preselectedLeadId || "",
    followUpDate: followUp?.followUpDate
      ? new Date(followUp.followUpDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    notes: followUp?.notes || "",
    status: followUp?.status || "PENDING",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/leads?limit=100")
      .then((r) => r.json())
      .then((data) => setLeads(data.leads || data))
      .catch(() => {});
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.leadId) newErrors.leadId = "Lead is required";
    if (!formData.followUpDate) newErrors.followUpDate = "Date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const url = followUp?.id ? `/api/follow-ups/${followUp.id}` : "/api/follow-ups";
      const method = followUp?.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          followUpDate: new Date(formData.followUpDate).toISOString(),
        }),
      });

      if (!res.ok) throw new Error("Failed to save follow-up");

      toast({
        title: "Success",
        description: followUp?.id ? "Follow-up updated" : "Follow-up scheduled",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/follow-ups");
        router.refresh();
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Lead */}
      <div className="space-y-1.5">
        <Label>
          Lead <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.leadId}
          onValueChange={(v) => setFormData({ ...formData, leadId: v })}
          disabled={!!preselectedLeadId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a lead" />
          </SelectTrigger>
          <SelectContent>
            {leads.map((lead) => (
              <SelectItem key={lead.id} value={lead.id}>
                {lead.name} — {lead.phone}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.leadId && <p className="text-xs text-red-500">{errors.leadId}</p>}
      </div>

      {/* Date */}
      <div className="space-y-1.5">
        <Label htmlFor="followUpDate">
          Follow-up Date <span className="text-red-500">*</span>
        </Label>
        <Input
          id="followUpDate"
          type="date"
          value={formData.followUpDate}
          onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
        />
        {errors.followUpDate && (
          <p className="text-xs text-red-500">{errors.followUpDate}</p>
        )}
      </div>

      {/* Status */}
      <div className="space-y-1.5">
        <Label>Status</Label>
        <Select
          value={formData.status}
          onValueChange={(v) => setFormData({ ...formData, status: v as any })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">⏳ Pending</SelectItem>
            <SelectItem value="COMPLETED">✅ Completed</SelectItem>
            <SelectItem value="MISSED">❌ Missed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="What should be discussed or done in this follow-up..."
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading} className="min-w-[140px]">
          {loading ? "Saving..." : followUp?.id ? "Update Follow-up" : "Schedule Follow-up"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
