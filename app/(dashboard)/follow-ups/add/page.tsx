import { FollowUpForm } from "@/components/follow-ups/FollowUpForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AddFollowUpPage() {
  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/follow-ups">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Schedule Follow-up</h2>
          <p className="text-sm text-gray-500">Set a follow-up reminder for a lead</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Follow-up Details</CardTitle>
        </CardHeader>
        <CardContent>
          <FollowUpForm />
        </CardContent>
      </Card>
    </div>
  );
}
