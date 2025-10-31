import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  Download,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  FileText,
} from "lucide-react";
import { MetricCard } from "@/components/metric-card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function Reports() {
  const [dateRange, setDateRange] = useState("last-12-months");

  //todo: remove mock functionality
  const membershipGrowth = [
    { month: "Nov '24", members: 280, newSignups: 15, churn: 8 },
    { month: "Dec '24", members: 287, newSignups: 18, churn: 11 },
    { month: "Jan '25", members: 294, newSignups: 22, churn: 15 },
    { month: "Feb '25", members: 301, newSignups: 20, churn: 13 },
    { month: "Mar '25", members: 308, newSignups: 25, churn: 18 },
    { month: "Apr '25", members: 315, newSignups: 28, churn: 21 },
    { month: "May '25", members: 322, newSignups: 24, churn: 17 },
    { month: "Jun '25", members: 329, newSignups: 19, churn: 12 },
    { month: "Jul '25", members: 334, newSignups: 21, churn: 16 },
    { month: "Aug '25", members: 339, newSignups: 23, churn: 18 },
    { month: "Sep '25", members: 344, newSignups: 26, churn: 21 },
    { month: "Oct '25", members: 342, newSignups: 20, churn: 22 },
  ];

  //todo: remove mock functionality
  const demographics = {
    age: [
      { range: "18-25", count: 89, color: "hsl(var(--chart-1))" },
      { range: "26-35", count: 142, color: "hsl(var(--chart-2))" },
      { range: "36-45", count: 78, color: "hsl(var(--chart-3))" },
      { range: "46-55", count: 25, color: "hsl(var(--chart-4))" },
      { range: "56+", count: 8, color: "hsl(var(--chart-5))" },
    ],
    gender: [
      { name: "Male", value: 215, color: "hsl(var(--chart-1))" },
      { name: "Female", value: 127, color: "hsl(var(--chart-2))" },
    ],
  };

  //todo: remove mock functionality
  const churnReasons = [
    { reason: "Relocation", count: 45 },
    { reason: "Financial", count: 38 },
    { reason: "Time Constraints", count: 32 },
    { reason: "Health Issues", count: 18 },
    { reason: "Dissatisfaction", count: 12 },
    { reason: "Other", count: 15 },
  ];

  //todo: remove mock functionality
  const peakSeasons = [
    { month: "Jan", type: "Peak", members: 294 },
    { month: "Feb", type: "Normal", members: 301 },
    { month: "Mar", type: "Normal", members: 308 },
    { month: "Apr", type: "Peak", members: 315 },
    { month: "May", type: "Normal", members: 322 },
    { month: "Jun", type: "Normal", members: 329 },
    { month: "Jul", type: "Slow", members: 334 },
    { month: "Aug", type: "Slow", members: 339 },
    { month: "Sep", type: "Peak", members: 344 },
    { month: "Oct", type: "Normal", members: 342 },
  ];

  const totalChurn = churnReasons.reduce((sum, r) => sum + r.count, 0);
  const churnRate = ((totalChurn / (342 + totalChurn)) * 100).toFixed(1);
  const conversionRate = 68.5;
  const lifetimeValue = 42500;
  const npsScore = 72;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Business intelligence and insights</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]" data-testid="select-date-range">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-30-days">Last 30 Days</SelectItem>
              <SelectItem value="last-3-months">Last 3 Months</SelectItem>
              <SelectItem value="last-6-months">Last 6 Months</SelectItem>
              <SelectItem value="last-12-months">Last 12 Months</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" data-testid="button-export-pdf">
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" data-testid="button-export-excel">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Churn Rate"
          value={`${churnRate}%`}
          icon={TrendingUp}
          trend={{ value: -2.3, isPositive: true }}
        />
        <MetricCard
          title="Lead Conversion"
          value={`${conversionRate}%`}
          icon={Users}
          subtitle="Inquiry to paid member"
        />
        <MetricCard
          title="Lifetime Value"
          value={`₹${lifetimeValue.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: 15.2, isPositive: true }}
        />
        <MetricCard
          title="NPS Score"
          value={npsScore}
          icon={BarChart3}
          subtitle="Net Promoter Score"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Membership Growth (12 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={membershipGrowth}>
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
              <Line
                type="monotone"
                dataKey="members"
                stroke="hsl(var(--chart-1))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--chart-1))" }}
                name="Total Members"
              />
              <Line
                type="monotone"
                dataKey="newSignups"
                stroke="hsl(var(--chart-3))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-3))" }}
                name="New Signups"
              />
              <Line
                type="monotone"
                dataKey="churn"
                stroke="hsl(var(--chart-5))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-5))" }}
                name="Churn"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Age Demographics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={demographics.age}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="range"
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
                <Bar dataKey="count" fill="hsl(var(--chart-1))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={demographics.gender}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {demographics.gender.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Churn Rate Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {churnReasons.map((reason) => (
              <div key={reason.reason} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{reason.reason}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{reason.count}</span>
                    <span className="text-muted-foreground">
                      ({((reason.count / totalChurn) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-chart-5 transition-all"
                    style={{ width: `${(reason.count / totalChurn) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Peak Season Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {peakSeasons.map((season) => (
              <div
                key={season.month}
                className="flex items-center justify-between p-3 border rounded-md"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{season.month}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono">{season.members} members</span>
                  {season.type === "Peak" && (
                    <span className="px-3 py-1 rounded-full bg-chart-3 text-white text-xs font-semibold">
                      PEAK
                    </span>
                  )}
                  {season.type === "Slow" && (
                    <span className="px-3 py-1 rounded-full bg-chart-4 text-white text-xs font-semibold">
                      SLOW
                    </span>
                  )}
                  {season.type === "Normal" && (
                    <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-semibold">
                      NORMAL
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
