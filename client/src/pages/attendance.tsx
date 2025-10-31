import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, getQueryFn, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AttendanceHeatmap } from "@/components/attendance-heatmap";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  UserCheck,
  Clock,
  TrendingUp,
  Search,
  LogIn,
  Users,
} from "lucide-react";
import { MetricCard } from "@/components/metric-card";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export default function Attendance() {
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);

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
  const weeklyTrend = [
    { day: "Mon", checkIns: 145 },
    { day: "Tue", checkIns: 152 },
    { day: "Wed", checkIns: 138 },
    { day: "Thu", checkIns: 161 },
    { day: "Fri", checkIns: 148 },
    { day: "Sat", checkIns: 178 },
    { day: "Sun", checkIns: 165 },
  ];

  const { data: attendance = [] } = useQuery({
    queryKey: ["/api/attendance"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  const { data: members = [] } = useQuery({
    queryKey: ["/api/members"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  const formSchema = z.object({ memberId: z.string().min(1) });
  type FormValues = z.infer<typeof formSchema>;
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema) });
  const manualCheckin = useMutation({
    mutationFn: async (values: FormValues) => {
      await apiRequest("POST", "/api/attendance", { memberId: values.memberId, markedVia: "manual" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      setOpen(false);
      form.reset();
    },
  });
  const memberById = new Map(members.map((m: any) => [m.id, m] as const));
  const today = new Date().toDateString();
  const todayCheckIns = attendance
    .filter((a: any) => new Date(a.checkInTime).toDateString() === today)
    .map((a: any) => {
      const m = memberById.get(a.memberId);
      return {
        id: a.id,
        name: m?.name ?? a.memberId,
        photoUrl: m?.photoUrl,
        checkInTime: new Date(a.checkInTime),
        checkOutTime: a.checkOutTime ? new Date(a.checkOutTime) : undefined,
      };
    });

  //todo: remove mock functionality
  const memberFrequency = [
    { category: "Regular (5+ days/week)", count: 142, color: "bg-chart-3 text-white" },
    { category: "Moderate (3-4 days/week)", count: 98, color: "bg-chart-1 text-white" },
    { category: "Irregular (1-2 days/week)", count: 67, color: "bg-chart-4 text-white" },
    { category: "Inactive (0 days)", count: 35, color: "bg-destructive text-destructive-foreground" },
  ];

  //todo: remove mock functionality
  const absentMembers = [
    { name: "David Brown", lastVisit: new Date(2025, 9, 15), daysSince: 16 },
    { name: "Lisa Anderson", lastVisit: new Date(2025, 9, 18), daysSince: 13 },
    { name: "James Wilson", lastVisit: new Date(2025, 9, 20), daysSince: 11 },
    { name: "Maria Garcia", lastVisit: new Date(2025, 9, 22), daysSince: 9 },
  ];

  const filteredCheckIns = todayCheckIns.filter((checkIn) =>
    checkIn.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attendance & Check-In</h1>
          <p className="text-muted-foreground">Monitor member attendance and activity</p>
        </div>
        <Button data-testid="button-manual-checkin" onClick={() => setOpen(true)}>
          <LogIn className="h-4 w-4 mr-2" />
          Manual Check-In
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Today's Check-ins"
          value={87}
          icon={UserCheck}
          subtitle="vs 82 yesterday"
        />
        <MetricCard
          title="Currently In Gym"
          value={42}
          icon={Users}
          subtitle="Active now"
        />
        <MetricCard
          title="Avg. Daily Check-ins"
          value={153}
          icon={Calendar}
          trend={{ value: 8.5, isPositive: true }}
        />
        <MetricCard
          title="Peak Hour"
          value="6-8 PM"
          icon={Clock}
          subtitle="Most active time"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Attendance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="day"
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
                  dataKey="checkIns"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--chart-1))" }}
                  name="Check-ins"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Member Frequency Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {memberFrequency.map((freq) => (
                <div key={freq.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{freq.category}</span>
                    <Badge className={freq.color}>{freq.count}</Badge>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-chart-1 transition-all"
                      style={{
                        width: `${(freq.count / 342) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <AttendanceHeatmap data={heatmapData} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
          <CardTitle>Today's Check-ins ({todayCheckIns.length})</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search check-ins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-checkins"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredCheckIns.map((checkIn) => (
              <div
                key={checkIn.id}
                className="flex items-center justify-between p-4 border rounded-md hover-elevate"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={checkIn.photoUrl} alt={checkIn.name} />
                    <AvatarFallback>{getInitials(checkIn.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{checkIn.name}</div>
                    <div className="text-sm text-muted-foreground">
                      In: {format(checkIn.checkInTime, "HH:mm")}
                      {checkIn.checkOutTime && ` • Out: ${format(checkIn.checkOutTime, "HH:mm")}`}
                    </div>
                  </div>
                </div>
                {!checkIn.checkOutTime ? (
                  <Badge className="bg-chart-3 text-white">In Gym</Badge>
                ) : (
                  <Badge variant="secondary">Completed</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manual Check-In</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => manualCheckin.mutate(v))} className="space-y-4">
              <FormField
                control={form.control}
                name="memberId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Member ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Member ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={manualCheckin.isPending}>Check In</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Absent Members Alert (7+ Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {absentMembers.map((member, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-md hover-elevate"
              >
                <div className="space-y-1">
                  <div className="font-medium">{member.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Last visit: {format(member.lastVisit, "MMM dd, yyyy")}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">{member.daysSince} days ago</Badge>
                  <Button size="sm" variant="outline" data-testid={`button-contact-${index}`}>
                    Contact
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
