import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MessageSquare, Send, Eye, CheckCircle2, XCircle } from "lucide-react";

export default function WhatsApp() {
  const { toast } = useToast();
  const [template, setTemplate] = useState(
    "Hi {name}, your {plan} expires in {daysLeft} days!"
  );
  const [sendTarget, setSendTarget] = useState<"pending" | "all">("pending");
  const [sendResults, setSendResults] = useState<{
    sent: number;
    failed: number;
    failedMembers: Array<{ memberId: string; phone: string; status: string }>;
  } | null>(null);

  // Get WhatsApp connection status
  const { data: status, refetch: refetchStatus } = useQuery({
    queryKey: ["/api/whatsapp/status"],
    queryFn: getQueryFn({ on401: "throw" }),
    refetchInterval: 5000, // Poll every 5 seconds
  });

  // Preview template mutation
  const previewMutation = useMutation({
    mutationFn: async (template: string) => {
      const res = await apiRequest("POST", "/api/whatsapp/test-template", {
        template,
      });
      return res.json();
    },
    onError: (error: any) => {
      toast({
        title: "Preview failed",
        description: error?.message || "Failed to preview template",
        variant: "destructive",
      });
    },
  });

  // Send bulk messages mutation
  const sendBulkMutation = useMutation({
    mutationFn: async ({
      template,
      target,
    }: {
      template: string;
      target: "pending" | "all";
    }) => {
      const body: { template: string; allMembers?: boolean } = {
        template,
        allMembers: target === "all",
      };
      
      const res = await apiRequest("POST", "/api/whatsapp/send-bulk", body);
      return res.json();
    },
    onSuccess: (data) => {
      const results = data.results || [];
      const sent = results.filter((r: any) => r.status === "sent").length;
      const failed = results.filter((r: any) => r.status !== "sent").length;
      const failedMembers = results.filter((r: any) => r.status !== "sent");

      setSendResults({
        sent,
        failed,
        failedMembers,
      });

      toast({
        title: "Messages sent",
        description: `${sent} sent, ${failed} failed`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Send failed",
        description: error?.message || "Failed to send messages",
        variant: "destructive",
      });
    },
  });

  const isConnected = status?.connected === true;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">WhatsApp Messaging</h1>
        <p className="text-muted-foreground">
          Send bulk messages to members via WhatsApp
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-lg font-medium">Connected ✅</span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="text-lg font-medium">Disconnected ❌</span>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchStatus()}
              className="ml-auto"
            >
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Template Editor */}
      <Card>
        <CardHeader>
          <CardTitle>Message Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="template">Template</Label>
            <Textarea
              id="template"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              rows={5}
              placeholder="Enter your message template..."
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Available placeholders: <code>{`{name}`}</code>,{" "}
              <code>{`{plan}`}</code>, <code>{`{daysLeft}`}</code>
            </p>
          </div>
          <Button
            onClick={() => previewMutation.mutate(template)}
            disabled={previewMutation.isPending}
            variant="outline"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>

          {/* Preview Results */}
          {previewMutation.data && (
            <div className="space-y-2 mt-4">
              <Label>Preview (3 sample members)</Label>
              <div className="grid gap-3">
                {previewMutation.data.samples?.map(
                  (
                    sample: { name: string; phone: string; preview: string },
                    index: number
                  ) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="space-y-1">
                          <div className="font-medium">{sample.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {sample.phone}
                          </div>
                          <div className="mt-2 p-2 bg-muted rounded text-sm">
                            {sample.preview}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Send Messages */}
      <Card>
        <CardHeader>
          <CardTitle>Send Messages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="target">Target</Label>
            <Select
              value={sendTarget}
              onValueChange={(value) =>
                setSendTarget(value as "pending" | "all")
              }
            >
              <SelectTrigger id="target" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">All Pending Payments</SelectItem>
                <SelectItem value="all">All Members</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-2">
              {sendTarget === "pending"
                ? "Sends to members with pending or overdue payment status"
                : "Sends to all members regardless of payment status"}
            </p>
          </div>

          <Button
            onClick={() => sendBulkMutation.mutate({ template, target: sendTarget })}
            disabled={!isConnected || sendBulkMutation.isPending || !template.trim()}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {sendBulkMutation.isPending ? "Sending..." : "Send Messages"}
          </Button>

          {!isConnected && (
            <p className="text-sm text-red-500">
              WhatsApp is not connected. Please connect first.
            </p>
          )}

          {/* Send Results */}
          {sendResults && (
            <div className="space-y-3 mt-4">
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>{sendResults.sent} sent</span>
                </div>
                <div className="flex items-center gap-1">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span>{sendResults.failed} failed</span>
                </div>
              </div>

              {sendResults.failedMembers.length > 0 && (
                <div>
                  <Label>Failed Members</Label>
                  <div className="space-y-2 mt-2">
                    {sendResults.failedMembers.map((failed, index) => (
                      <Card key={index}>
                        <CardContent className="p-3">
                          <div className="text-sm">
                            <div className="font-medium">
                              Member ID: {failed.memberId}
                            </div>
                            <div className="text-muted-foreground">
                              Phone: {failed.phone}
                            </div>
                            <div className="text-red-500 mt-1">
                              Status: {failed.status}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

