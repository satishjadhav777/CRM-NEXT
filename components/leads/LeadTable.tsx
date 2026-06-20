"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { formatDate } from "@/lib/utils";
import { Lead } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";

interface LeadTableProps {
  leads: Lead[];
  onRefresh?: () => void;
}

export function LeadTable({ leads, onRefresh }: LeadTableProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete lead "${name}"? This cannot be undone.`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");

      toast({ title: "Lead deleted successfully" });
      onRefresh?.();
      router.refresh();
    } catch {
      toast({
        title: "Error deleting lead",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <UserPlus className="h-10 w-10 text-gray-300" />
        <h3 className="mt-3 text-sm font-semibold text-gray-700">No leads found</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by adding a new lead</p>
        <Link href="/leads/add" className="mt-4">
          <Button size="sm">Add Lead</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
              Contact
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
              Source
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
              Assigned To
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
              Created
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, idx) => (
            <tr
              key={lead.id}
              className={`border-b transition-colors hover:bg-gray-50 ${
                idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"
              }`}
            >
              <td className="px-4 py-3">
                <Link
                  href={`/leads/${lead.id}`}
                  className="font-medium text-gray-900 hover:text-blue-600 hover:underline"
                >
                  {lead.name}
                </Link>
              </td>
              <td className="px-4 py-3">
                <div className="text-gray-700">{lead.phone}</div>
                {lead.email && (
                  <div className="text-xs text-gray-500">{lead.email}</div>
                )}
              </td>
              <td className="px-4 py-3 text-gray-600">{lead.source}</td>
              <td className="px-4 py-3">
                <LeadStatusBadge status={lead.status} />
              </td>
              <td className="px-4 py-3 text-gray-600">
                {lead.assignedUser?.name || (
                  <span className="text-gray-400 italic">Unassigned</span>
                )}
              </td>
              <td className="px-4 py-3 text-gray-500">
                {formatDate(lead.createdAt)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Link href={`/leads/${lead.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <Link href={`/leads/${lead.id}?edit=true`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700"
                    disabled={deletingId === lead.id}
                    onClick={() => handleDelete(lead.id, lead.name)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
