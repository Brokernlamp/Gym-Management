import { MetricCard } from "@/components/metric-card";
import { RevenueChart } from "@/components/revenue-chart";
import { PaymentTable } from "@/components/payment-table";
import { AttendanceHeatmap } from "@/components/attendance-heatmap";
import { Users, DollarSign, TrendingUp, AlertCircle, Calendar, UserCheck, UserPlus, Percent } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  //todo: remove mock functionality
  const revenueData = [
    { month: "May", revenue: 245000 },
    { month: "Jun", revenue: 282000 },
    { month: "Jul", revenue: 268000 },
    { month: "Aug", revenue: 305000 },
    { month: "Sep", revenue: 291000 },
    { month: "Oct", revenue: 324000 },
  ];

  //todo: remove mock functionality
  const heatmapData = [];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  for (const day of days) {
    for (let hour = 6; hour < 20; hour++) {
      const isEveningPeak = hour >= 17 && hour <= 19;
      const isMorningPeak = hour >= 6 && hour <= 8;
      const isWeekend = day === "Sat" || day === "Sun";
      
      let baseCount = 15;
      if (isEveningPeak) baseCount += 25;
      if (isMorningPeak) baseCount += 15;
      if (isWeekend) baseCount += 10;
      
      const count = Math.floor(baseCount + Math.random() * 10);
      heatmapData.push({ hour, day, count });
    }
  }

  //todo: remove mock functionality
  const pendingPayments = [
    {
      id: "1",
      memberName: "Rajesh Kumar",
      amount: 5000,
      dueDate: new Date(2025, 10, 5),
      status: "pending" as const,
      planName: "Premium Annual",
    },
    {
      id: "2",
      memberName: "Priya Sharma",
      amount: 3000,
      dueDate: new Date(2025, 9, 28),
      status: "overdue" as const,
      planName: "Basic Monthly",
    },
    {
      id: "3",
      memberName: "Amit Patel",
      amount: 4500,
      dueDate: new Date(2025, 10, 8),
      status: "pending" as const,
      planName: "Premium Quarterly",
    },
  ];

  //todo: remove mock functionality
  const todayCheckIns = [
    { name: "Sarah Johnson", time: "06:15 AM" },
    { name: "Michael Chen", time: "07:30 AM" },
    { name: "Emma Wilson", time: "08:45 AM" },
    { name: "David Brown", time: "09:00 AM" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your gym overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Active Members"
          value={342}
          icon={Users}
          trend={{ value: 12.5, isPositive: true }}
        />
        <MetricCard
          title="Today's Check-ins"
          value={87}
          icon={Calendar}
          subtitle="vs 82 yesterday"
        />
        <MetricCard
          title="Monthly Revenue (MRR)"
          value="₹3,24,000"
          icon={DollarSign}
          trend={{ value: 8.2, isPositive: true }}
        />
        <MetricCard
          title="Pending Payments"
          value={12}
          icon={AlertCircle}
          subtitle="₹54,000 total due"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Today's Revenue"
          value="₹12,500"
          icon={TrendingUp}
          subtitle="Target: ₹15,000"
        />
        <MetricCard
          title="Retention Rate"
          value="94.2%"
          icon={Percent}
          trend={{ value: 2.1, isPositive: true }}
        />
        <MetricCard
          title="New Signups"
          value={8}
          icon={UserPlus}
          subtitle="This week"
        />
        <MetricCard
          title="Expiring This Week"
          value={15}
          icon={UserCheck}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RevenueChart data={revenueData} />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle>Today's Check-ins</CardTitle>
            <Button size="sm" variant="outline" data-testid="button-view-all-checkins">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayCheckIns.map((checkin, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-md hover-elevate"
                >
                  <span className="font-medium">{checkin.name}</span>
                  <span className="text-sm text-muted-foreground font-mono">{checkin.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <AttendanceHeatmap data={heatmapData} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
          <CardTitle>Pending Payments</CardTitle>
          <Button size="sm" variant="outline" data-testid="button-view-all-payments">
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <PaymentTable
            payments={pendingPayments}
            onSendReminder={(id) => console.log("Send reminder to payment:", id)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
