import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send } from "lucide-react";

interface Template {
  id: string;
  name: string;
  category: "payment" | "expiry" | "welcome" | "birthday" | "announcement";
  message: string;
  variables: string[];
}

interface WhatsAppTemplateProps {
  templates: Template[];
  onSelectTemplate: (id: string) => void;
  onSend: (id: string) => void;
}

export function WhatsAppTemplate({ templates, onSelectTemplate, onSend }: WhatsAppTemplateProps) {
  const categoryColors = {
    payment: "bg-chart-1 text-white",
    expiry: "bg-chart-4 text-white",
    welcome: "bg-chart-3 text-white",
    birthday: "bg-chart-2 text-white",
    announcement: "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-4">
      {templates.map((template) => (
        <Card key={template.id} className="hover-elevate">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {template.name}
                </CardTitle>
                <Badge className={categoryColors[template.category]}>
                  {template.category}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm whitespace-pre-wrap">{template.message}</p>
            </div>
            {template.variables.length > 0 && (
              <div className="text-xs text-muted-foreground">
                Variables: {template.variables.map((v) => `{${v}}`).join(", ")}
              </div>
            )}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSelectTemplate(template.id)}
                data-testid={`button-select-template-${template.id}`}
              >
                Use Template
              </Button>
              <Button
                size="sm"
                onClick={() => onSend(template.id)}
                data-testid={`button-send-template-${template.id}`}
              >
                <Send className="h-4 w-4 mr-1" />
                Send Now
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
