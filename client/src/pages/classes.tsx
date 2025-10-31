import { ClassCard } from "@/components/class-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Classes() {
  //todo: remove mock functionality
  const upcomingClasses = [
    {
      id: "1",
      name: "Morning Yoga",
      type: "Yoga",
      trainerName: "Sarah Johnson",
      startTime: new Date(2025, 10, 1, 7, 0),
      endTime: new Date(2025, 10, 1, 8, 0),
      capacity: 20,
      enrolled: 18,
    },
    {
      id: "2",
      name: "HIIT Workout",
      type: "CrossFit",
      trainerName: "Mike Stevens",
      startTime: new Date(2025, 10, 1, 9, 0),
      endTime: new Date(2025, 10, 1, 10, 0),
      capacity: 15,
      enrolled: 15,
    },
    {
      id: "3",
      name: "Zumba Dance",
      type: "Zumba",
      trainerName: "Maria Garcia",
      startTime: new Date(2025, 10, 1, 18, 0),
      endTime: new Date(2025, 10, 1, 19, 0),
      capacity: 25,
      enrolled: 22,
    },
    {
      id: "4",
      name: "Pilates Core",
      type: "Pilates",
      trainerName: "Emma Wilson",
      startTime: new Date(2025, 10, 1, 19, 30),
      endTime: new Date(2025, 10, 1, 20, 30),
      capacity: 12,
      enrolled: 8,
    },
  ];

  //todo: remove mock functionality
  const popularClasses = [
    { name: "HIIT Workout", attendance: 98 },
    { name: "Zumba Dance", attendance: 94 },
    { name: "Morning Yoga", attendance: 89 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Classes & Schedule</h1>
          <p className="text-muted-foreground">Manage group classes and schedules</p>
        </div>
        <Button data-testid="button-create-class">
          <Plus className="h-4 w-4 mr-2" />
          Create Class
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">{upcomingClasses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Enrollment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">
              {upcomingClasses.reduce((sum, c) => sum + c.enrolled, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Capacity Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">
              {Math.round(
                (upcomingClasses.reduce((sum, c) => sum + c.enrolled, 0) /
                  upcomingClasses.reduce((sum, c) => sum + c.capacity, 0)) *
                  100
              )}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Most Popular Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {popularClasses.map((classItem, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                    {index + 1}
                  </div>
                  <span className="font-medium">{classItem.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{classItem.attendance}% attendance</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">Upcoming Classes</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {upcomingClasses.map((classItem) => (
            <ClassCard
              key={classItem.id}
              {...classItem}
              onViewDetails={(id) => console.log("View details:", id)}
              onManageEnrollment={(id) => console.log("Manage enrollment:", id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
