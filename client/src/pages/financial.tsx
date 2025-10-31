import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaymentTable } from "@/components/payment-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Wallet,
  Download,
  FileText,
  Plus,
} from "lucide-react";
import { MetricCard } from "@/components/metric-card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export default function Financial() {
  const [paymentMethod, setPaymentMethod] = useState("all");

  //todo: remove mock functionality
  const revenueByPlan = [
    { name: "Premium Annual", value: 145000, color: "hsl(var(--chart-1))" },
    { name: "Basic Monthly", value: 89000, color: "hsl(var(--chart-2))" },
    { name: "Premium Quarterly", value: 65000, color: "hsl(var(--chart-3))" },
    { name: "Personal Training", value: 25000, color: "hsl(var(--chart-4))" },
  ];

  //todo: remove mock functionality
  const monthlyRevenue = [
    { month: "May", revenue: 245000, expenses: 180000 },
    { month: "Jun", revenue: 282000, expenses: 175000 },
    { month: "Jul", revenue: 268000, expenses: 185000 },
    { month: "Aug", revenue: 305000, expenses: 190000 },
    { month: "Sep", revenue: 291000, expenses: 182000 },
    { month: "Oct", revenue: 324000, expenses: 195000 },
  ];

  const { data: payments = [] } = useQuery({
    queryKey: ["/api/payments"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  const { data: members = [] } = useQuery({
    queryKey: ["/api/members"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  const memberById = new Map(members.map((m: any) => [m.id, m] as const));
  const pendingPayments = payments
    .filter((p: any) => p.status === "pending" || p.status === "overdue")
    .map((p: any) => ({
      id: p.id,
      memberName: memberById.get(p.memberId)?.name ?? p.memberId,
      amount: Number(p.amount ?? 0),
      dueDate: p.dueDate ? new Date(p.dueDate) : undefined,
      status: p.status,
      planName: p.planName ?? undefined,
    }));

  //todo: remove mock functionality
  const recentTransactions = [
    {
      id: "1",
      memberName: "Sarah Johnson",
      amount: 5000,
      method: "UPI",
      date: new Date(2025, 9, 30),
      planName: "Premium Annual",
    },
    {
      id: "2",
      memberName: "Michael Chen",
      amount: 3000,
      method: "Card",
      date: new Date(2025, 9, 30),
      planName: "Basic Monthly",
    },
    {
      id: "3",
      memberName: "Emma Wilson",
      amount: 4500,
      method: "Cash",
      date: new Date(2025, 9, 29),
      planName: "Premium Quarterly",
    },
  ];

  const totalRevenue = monthlyRevenue[monthlyRevenue.length - 1].revenue;
  const totalExpenses = monthlyRevenue[monthlyRevenue.length - 1].expenses;
  const profitMargin = ((totalRevenue - totalExpenses) / totalRevenue) * 100;
  const collectionRate = 87.5;
  const avgRevenuePerMember = Math.round(totalRevenue / 342);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Dashboard</h1>
          <p className="text-muted-foreground">Track revenue, expenses, and payments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-export-financial">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button data-testid="button-process-payment">
            <Plus className="h-4 w-4 mr-2" />
            Process Payment
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Monthly Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: 11.3, isPositive: true }}
        />
        <MetricCard
          title="Profit Margin"
          value={`${profitMargin.toFixed(1)}%`}
          icon={TrendingUp}
          trend={{ value: 3.2, isPositive: true }}
        />
        <MetricCard
          title="Collection Rate"
          value={`${collectionRate}%`}
          icon={CreditCard}
          subtitle="Payment success rate"
        />
        <MetricCard
          title="Avg Revenue/Member"
          value={`₹${avgRevenuePerMember.toLocaleString()}`}
          icon={Wallet}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Legend />
                <Bar dataKey="revenue" fill="hsl(var(--chart-1))" name="Revenue" />
                <Bar dataKey="expenses" fill="hsl(var(--chart-5))" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueByPlan}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {revenueByPlan.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                  formatter={(value: number) => `₹${value.toLocaleString()}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
          <CardTitle>Pending Payments</CardTitle>
          <div className="flex gap-2">
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="w-[150px]" data-testid="select-payment-method">
                <SelectValue placeholder="Payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="online">Online</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <PaymentTable
            payments={pendingPayments}
            onSendReminder={(id) => console.log("Send reminder:", id)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
          <CardTitle>Recent Transactions</CardTitle>
          <Button size="sm" variant="outline" data-testid="button-view-all-transactions">
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-md hover-elevate"
              >
                <div className="space-y-1">
                  <div className="font-medium">{transaction.memberName}</div>
                  <div className="text-sm text-muted-foreground">
                    {transaction.planName} • {transaction.method}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold font-mono">₹{transaction.amount.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">
                    {transaction.date.toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { category: "Rent", amount: 80000, percentage: 41 },
              { category: "Staff Salaries", amount: 65000, percentage: 33 },
              { category: "Utilities", amount: 25000, percentage: 13 },
              { category: "Equipment Maintenance", amount: 15000, percentage: 8 },
              { category: "Others", amount: 10000, percentage: 5 },
            ].map((expense) => (
              <div key={expense.category} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{expense.category}</span>
                  <span className="font-mono">₹{expense.amount.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-chart-5 transition-all"
                    style={{ width: `${expense.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
