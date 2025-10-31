import { WhatsAppTemplate } from "../whatsapp-template";

export default function WhatsAppTemplateExample() {
  const mockTemplates = [
    {
      id: "1",
      name: "Payment Reminder",
      category: "payment" as const,
      message: "Hi {Name},\n\nYour payment of ₹{Amount} for {Plan} is due on {Date}. Please make the payment to avoid interruption.\n\nThank you!",
      variables: ["Name", "Amount", "Plan", "Date"],
    },
    {
      id: "2",
      name: "Membership Expiry Alert",
      category: "expiry" as const,
      message: "Dear {Name},\n\nYour {Plan} membership expires on {Date}. Renew now to continue enjoying our facilities!\n\nBest regards,\nGym Team",
      variables: ["Name", "Plan", "Date"],
    },
  ];

  return (
    <div className="p-4">
      <WhatsAppTemplate
        templates={mockTemplates}
        onSelectTemplate={(id) => console.log("Select template", id)}
        onSend={(id) => console.log("Send", id)}
      />
    </div>
  );
}
