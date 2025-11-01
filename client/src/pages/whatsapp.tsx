import { WhatsAppTemplate } from "@/components/whatsapp-template";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Send, Clock, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function WhatsApp() {
  const { toast } = useToast();
  const templates = [
    {
      id: "1",
      name: "Payment Reminder",
      category: "payment" as const,
      message: "Hi {Name},\n\nYour payment of ₹{Amount} for {Plan} is due on {Date}. Please make the payment to avoid interruption.\n\nThank you!\nGymAdmin Team",
      variables: ["Name", "Amount", "Plan", "Date"],
    },
    {
      id: "2",
      name: "Membership Expiry Alert",
      category: "expiry" as const,
      message: "Dear {Name},\n\nYour {Plan} membership expires on {Date}. Renew now to continue enjoying our facilities!\n\nBest regards,\nGymAdmin Team",
      variables: ["Name", "Plan", "Date"],
    },
    {
      id: "3",
      name: "Welcome Message",
      category: "welcome" as const,
      message: "Welcome to GymAdmin, {Name}! 🎉\n\nWe're excited to have you join us. Your {Plan} membership is now active.\n\nLet's achieve your fitness goals together!\n\nSee you at the gym!",
      variables: ["Name", "Plan"],
    },
    {
      id: "4",
      name: "Birthday Wishes",
      category: "birthday" as const,
      message: "Happy Birthday, {Name}! 🎂🎉\n\nWishing you a wonderful day filled with joy and success. As a birthday gift, enjoy a complimentary personal training session!\n\nCheers,\nGymAdmin Team",
      variables: ["Name"],
    },
  ];

  // WhatsApp messaging not implemented - stats not available
  const messageStats = {
    sent: 0,
    scheduled: 0,
    delivered: 0,
    deliveryRate: 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">WhatsApp Automation</h1>
          <p className="text-muted-foreground">Manage automated messages and templates</p>
        </div>
        <Button data-testid="button-create-template">
          <MessageSquare className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Messages Sent</CardTitle>
            <Send className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">{messageStats.sent}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Scheduled</CardTitle>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">{messageStats.scheduled}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending delivery</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Delivered</CardTitle>
            <CheckCircle className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">{messageStats.delivered}</div>
            <p className="text-xs text-muted-foreground mt-1">Successfully delivered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Delivery Rate</CardTitle>
            <CheckCircle className="h-5 w-5 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">N/A</div>
            <p className="text-xs text-muted-foreground mt-1">Feature not implemented</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Message Templates</h2>
        <WhatsAppTemplate
          templates={templates}
          onSelectTemplate={(id) => {
            const template = templates.find((t) => t.id === id);
            toast({
              title: "Template Selected",
              description: template ? `Selected: ${template.name}` : "Template selected",
            });
          }}
          onSend={(id) => {
            const template = templates.find((t) => t.id === id);
            toast({
              title: "Message Sent",
              description: template ? `${template.name} sent via WhatsApp` : "Message sent",
            });
          }}
        />
      </div>
    </div>
  );
}
