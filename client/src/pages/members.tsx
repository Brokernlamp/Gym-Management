import { useState } from "react";
import { MemberCard } from "@/components/member-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Members() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  //todo: remove mock functionality
  const members = [
    {
      id: "1",
      name: "Rajesh Kumar",
      photoUrl: undefined,
      planName: "Premium Annual",
      expiryDate: new Date(2026, 2, 15),
      status: "active" as const,
      paymentStatus: "paid" as const,
      lastCheckIn: new Date(2025, 9, 30),
    },
    {
      id: "2",
      name: "Priya Sharma",
      photoUrl: undefined,
      planName: "Basic Monthly",
      expiryDate: new Date(2025, 10, 5),
      status: "active" as const,
      paymentStatus: "pending" as const,
      lastCheckIn: new Date(2025, 9, 29),
    },
    {
      id: "3",
      name: "Amit Patel",
      photoUrl: undefined,
      planName: "Premium Quarterly",
      expiryDate: new Date(2025, 9, 25),
      status: "expired" as const,
      paymentStatus: "overdue" as const,
      lastCheckIn: new Date(2025, 9, 20),
    },
    {
      id: "4",
      name: "Sneha Reddy",
      photoUrl: undefined,
      planName: "Basic Monthly",
      expiryDate: new Date(2025, 11, 1),
      status: "frozen" as const,
      paymentStatus: "paid" as const,
      lastCheckIn: new Date(2025, 9, 15),
    },
  ];

  const filteredMembers = members.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    active: members.filter((m) => m.status === "active").length,
    expiringThisWeek: 15,
    expired: members.filter((m) => m.status === "expired").length,
    paymentPending: members.filter((m) => m.paymentStatus === "pending" || m.paymentStatus === "overdue").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Members</h1>
          <p className="text-muted-foreground">Manage your gym members</p>
        </div>
        <Button data-testid="button-add-member">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expiring This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">{stats.expiringThisWeek}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">{stats.expired}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Payment Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">{stats.paymentPending}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-members"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]" data-testid="select-status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="pending">Pending Renewal</SelectItem>
            <SelectItem value="frozen">Frozen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.map((member) => (
          <MemberCard
            key={member.id}
            {...member}
            onViewProfile={(id) => console.log("View profile:", id)}
            onSendReminder={(id) => console.log("Send reminder:", id)}
            onFreeze={(id) => console.log("Freeze:", id)}
            onExtend={(id) => console.log("Extend:", id)}
          />
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No members found matching your criteria
        </div>
      )}
    </div>
  );
}
