"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Plus, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Modal } from "@/components/shared/Modal";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { formatDate, cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { User } from "@/types";

const roleConfig = {
  ADMIN: { label: "Admin", className: "bg-red-100 text-red-700" },
  MANAGER: { label: "Manager", className: "bg-blue-100 text-blue-700" },
  SALES: { label: "Sales", className: "bg-green-100 text-green-700" },
};

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<(User & { _count?: { leads: number } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const userRole = (session?.user as any)?.role;

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "SALES",
  });

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create user");
      }
      toast({ title: "User created successfully" });
      setShowModal(false);
      setForm({ name: "", email: "", password: "", role: "SALES" });
      fetchUsers();
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Error creating user",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (userRole !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Shield className="h-12 w-12 text-gray-300" />
        <h3 className="mt-3 font-semibold text-gray-700">Access Restricted</h3>
        <p className="mt-1 text-sm text-gray-500">
          Only administrators can access user management.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-sm text-gray-500">{users.length} users</p>
        </div>
        <Button className="gap-2" onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {loading ? (
        <PageLoader />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Leads</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => {
                const cfg = roleConfig[user.role as keyof typeof roleConfig];
                return (
                  <tr key={user.id} className={cn("border-b hover:bg-gray-50", idx % 2 === 0 ? "bg-white" : "bg-gray-50/30")}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", cfg?.className)}>
                        {cfg?.label || user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {(user as any)._count?.leads || 0}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(user.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showModal} onOpenChange={setShowModal} title="Add New User">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Full Name</Label>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="john@company.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Password</Label>
            <Input
              required
              type="password"
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Min. 6 characters"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="MANAGER">Manager</SelectItem>
                <SelectItem value="SALES">Sales</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving}>{saving ? "Creating..." : "Create User"}</Button>
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
