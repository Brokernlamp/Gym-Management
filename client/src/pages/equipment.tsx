import { EquipmentStatus } from "@/components/equipment-status";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Wrench, AlertTriangle, CheckCircle } from "lucide-react";

export default function Equipment() {
  //todo: remove mock functionality
  const equipment = [
    {
      id: "1",
      name: "Treadmill #1",
      category: "Cardio",
      status: "operational" as const,
      nextMaintenance: new Date(2025, 11, 15),
    },
    {
      id: "2",
      name: "Bench Press",
      category: "Strength",
      status: "maintenance" as const,
      nextMaintenance: new Date(2025, 10, 5),
    },
    {
      id: "3",
      name: "Rowing Machine #2",
      category: "Cardio",
      status: "repair" as const,
      nextMaintenance: new Date(2025, 10, 1),
    },
    {
      id: "4",
      name: "Leg Press",
      category: "Strength",
      status: "operational" as const,
      nextMaintenance: new Date(2025, 11, 20),
    },
    {
      id: "5",
      name: "Elliptical #3",
      category: "Cardio",
      status: "operational" as const,
      nextMaintenance: new Date(2025, 11, 10),
    },
  ];

  const stats = {
    total: equipment.length,
    operational: equipment.filter((e) => e.status === "operational").length,
    maintenance: equipment.filter((e) => e.status === "maintenance").length,
    repair: equipment.filter((e) => e.status === "repair").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Equipment Management</h1>
          <p className="text-muted-foreground">Track and maintain gym equipment</p>
        </div>
        <Button data-testid="button-add-equipment">
          <Plus className="h-4 w-4 mr-2" />
          Add Equipment
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Equipment</CardTitle>
            <Wrench className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Operational</CardTitle>
            <CheckCircle className="h-5 w-5 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums text-chart-3">{stats.operational}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Maintenance</CardTitle>
            <Wrench className="h-5 w-5 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums text-chart-4">{stats.maintenance}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Needs Repair</CardTitle>
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums text-destructive">{stats.repair}</div>
          </CardContent>
        </Card>
      </div>

      <EquipmentStatus
        equipment={equipment}
        onScheduleMaintenance={(id) => console.log("Schedule maintenance:", id)}
      />

      <Card>
        <CardHeader>
          <CardTitle>Maintenance Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            Equipment maintenance calendar coming soon
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
