import Link from "next/link";
import { Lead } from "@/types";
import { LeadStatusBadge } from "@/components/leads/LeadStatusBadge";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface RecentLeadsProps {
  leads: Lead[];
}

export function RecentLeads({ leads }: RecentLeadsProps) {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Name
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Source
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="py-3 pr-4">
                  <Link
                    href={`/leads/${lead.id}`}
                    className="font-medium text-gray-900 hover:text-blue-600"
                  >
                    {lead.name}
                  </Link>
                  <p className="text-xs text-gray-500">{lead.phone}</p>
                </td>
                <td className="py-3 pr-4 text-gray-600">{lead.source}</td>
                <td className="py-3 pr-4">
                  <LeadStatusBadge status={lead.status} />
                </td>
                <td className="py-3 text-gray-500">
                  {formatDate(lead.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-right">
        <Link href="/leads">
          <Button variant="ghost" size="sm" className="gap-1 text-blue-600">
            View all leads <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
