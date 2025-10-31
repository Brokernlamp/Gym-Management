import { EquipmentStatus } from "@/components/equipment-status";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Wrench, AlertTriangle, CheckCircle } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, getQueryFn, queryClient } from "@/lib/queryClient";

export default function Equipment() {
  const { data: equipment = [] } = useQuery({
    queryKey: ["/api/equipment"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const addEquipment = useMutation({
    mutationFn: async () => {
      const name = window.prompt("Equipment name")?.trim();
      const category = window.prompt("Category")?.trim();
      if (!name || !category) return;
      await apiRequest("POST", "/api/equipment", {
        name,
        category,
        status: "operational",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
    },
  });

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
        <Button data-testid="button-add-equipment" onClick={() => addEquipment.mutate()}>
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
