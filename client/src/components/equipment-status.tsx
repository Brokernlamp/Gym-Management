import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wrench, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface Equipment {
  id: string;
  name: string;
  category: string;
  status: "operational" | "maintenance" | "repair";
  nextMaintenance: Date;
}

interface EquipmentStatusProps {
  equipment: Equipment[];
  onScheduleMaintenance: (id: string) => void;
}

export function EquipmentStatus({ equipment, onScheduleMaintenance }: EquipmentStatusProps) {
  const statusColors = {
    operational: "bg-chart-3 text-white",
    maintenance: "bg-chart-4 text-white",
    repair: "bg-destructive text-destructive-foreground",
  };

  const needsAttention = equipment.filter(
    (eq) => eq.status !== "operational"
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle>Equipment Status</CardTitle>
        {needsAttention.length > 0 && (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {needsAttention.length} Needs Attention
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {equipment.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 p-3 border rounded-md hover-elevate"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{item.name}</h4>
                  <Badge variant="secondary" className={statusColors[item.status]}>
                    {item.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {item.category} • Next maintenance: {format(item.nextMaintenance, "MMM dd, yyyy")}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onScheduleMaintenance(item.id)}
                data-testid={`button-schedule-${item.id}`}
              >
                <Wrench className="h-4 w-4 mr-1" />
                Schedule
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
