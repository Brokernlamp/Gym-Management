import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { insertMemberSchema, insertPaymentSchema, insertEquipmentSchema, insertAttendanceSchema, settingsSchema, insertPlanSchema } from "@shared/schema";
import { sendWhatsAppMessage, isWAConnected, currentQR } from "./whatsapp";
import { calculateDaysLeft, formatPhoneNumber } from "./whatsapp-handlers";
import { getDb } from "./db";
import { randomUUID } from "crypto";
import { syncMemberToGoogleSheets, removeMemberFromGoogleSheets } from "./google-sheets";

export async function registerRoutes(app: Express): Promise<void> {
	// helper
	const jsonOk = (res: Response, body: unknown, status = 200) => res.status(status).json(body);

	// Simple test endpoint
	app.get("/api/test", (_req: Request, res: Response) => {
		return jsonOk(res, { message: "API is working!", timestamp: new Date().toISOString() });
	});

	// members
app.get("/api/members", async (_req: Request, res: Response, next: NextFunction) => {
		try {
			console.log("GET /api/members called");
			const items = await storage.listMembers();
			console.log("GET /api/members returning", items.length, "items");
			return jsonOk(res, items);
		} catch (err) {
			console.error("GET /api/members error:", err);
			next(err);
		}
	});

app.post("/api/members", async (req: Request, res: Response, next: NextFunction) => {
		try {
			const data = insertMemberSchema.parse(req.body);
		const created = await storage.createMember(data);
		
		// Sync to Google Sheets (non-blocking)
		syncMemberToGoogleSheets(created).catch((err) => {
			console.error("Failed to sync member to Google Sheets:", err);
		});
		
		return jsonOk(res, created, 201);
		} catch (err) {
			next(err);
		}
	});

app.patch("/api/members/:id", async (req: Request, res: Response) => {
		const updated = await storage.updateMember(req.params.id, req.body ?? {});
		if (!updated) return res.status(404).json({ message: "Not found" });
		
		// Sync to Google Sheets (non-blocking)
		syncMemberToGoogleSheets(updated).catch((err) => {
			console.error("Failed to sync member to Google Sheets:", err);
		});
		
		return jsonOk(res, updated);
	});

app.delete("/api/members/:id", async (req: Request, res: Response) => {
		// Get member before deleting to get phone number
		const member = await storage.getMember(req.params.id);
		const phone = member?.phone || "";
		
		const ok = await storage.deleteMember(req.params.id);
		if (!ok) return res.status(404).json({ message: "Not found" });
		
		// Remove from Google Sheets (non-blocking)
		if (phone) {
			removeMemberFromGoogleSheets(phone).catch((err) => {
				console.error("Failed to remove member from Google Sheets:", err);
			});
		}
		
		return res.status(204).end();
	});

	// payments
app.get("/api/payments", async (_req: Request, res: Response) => {
		const items = await storage.listPayments();
		return jsonOk(res, items);
	});

app.post("/api/payments", async (req: Request, res: Response, next: NextFunction) => {
		try {
			const data = insertPaymentSchema.parse(req.body);
		const created = await storage.createPayment(data);
		return jsonOk(res, created, 201);
		} catch (err) {
			next(err);
		}
	});

app.patch("/api/payments/:id", async (req: Request, res: Response) => {
		const updated = await storage.updatePayment(req.params.id, req.body ?? {});
		if (!updated) return res.status(404).json({ message: "Not found" });
		return jsonOk(res, updated);
	});

app.delete("/api/payments/:id", async (req: Request, res: Response) => {
		const ok = await storage.deletePayment(req.params.id);
		if (!ok) return res.status(404).json({ message: "Not found" });
		return res.status(204).end();
	});

	// equipment
app.get("/api/equipment", async (_req: Request, res: Response) => {
		const items = await storage.listEquipment();
		return jsonOk(res, items);
	});

app.post("/api/equipment", async (req: Request, res: Response, next: NextFunction) => {
		try {
			const data = insertEquipmentSchema.parse(req.body);
		const created = await storage.createEquipment(data);
		return jsonOk(res, created, 201);
		} catch (err) {
			next(err);
		}
	});

app.patch("/api/equipment/:id", async (req: Request, res: Response) => {
		const updated = await storage.updateEquipment(req.params.id, req.body ?? {});
		if (!updated) return res.status(404).json({ message: "Not found" });
		return jsonOk(res, updated);
	});

app.delete("/api/equipment/:id", async (req: Request, res: Response) => {
		const ok = await storage.deleteEquipment(req.params.id);
		if (!ok) return res.status(404).json({ message: "Not found" });
		return res.status(204).end();
	});

	// attendance
app.get("/api/attendance", async (_req: Request, res: Response) => {
		const items = await storage.listAttendance();
		return jsonOk(res, items);
	});

app.post("/api/attendance", async (req: Request, res: Response, next: NextFunction) => {
		try {
			const data = insertAttendanceSchema.parse(req.body);
		const created = await storage.createAttendance(data);
		return jsonOk(res, created, 201);
		} catch (err) {
			next(err);
		}
	});

app.patch("/api/attendance/:id", async (req: Request, res: Response) => {
		const updated = await storage.updateAttendance(req.params.id, req.body ?? {});
		if (!updated) return res.status(404).json({ message: "Not found" });
		return jsonOk(res, updated);
	});

app.delete("/api/attendance/:id", async (req: Request, res: Response) => {
		const ok = await storage.deleteAttendance(req.params.id);
		if (!ok) return res.status(404).json({ message: "Not found" });
		return res.status(204).end();
	});

	// settings
	app.get("/api/settings", async (_req: Request, res: Response) => {
		try {
			const settings = await storage.getSettings();
			return jsonOk(res, settings);
		} catch (err) {
			return res.status(500).json({ message: err instanceof Error ? err.message : "Failed to get settings" });
		}
	});

	app.post("/api/settings", async (req: Request, res: Response, next: NextFunction) => {
		try {
			const data = settingsSchema.parse(req.body);
			const updated = await storage.updateSettings(data);
			return jsonOk(res, updated);
		} catch (err) {
			next(err);
		}
	});

	// member lookup by login code (for user attendance)
	app.get("/api/members/login/:code", async (req: Request, res: Response) => {
		try {
			const member = await storage.getMemberByLoginCode(req.params.code);
			if (!member) {
				return res.status(404).json({ message: "Member not found" });
			}
			return jsonOk(res, member);
		} catch (err) {
			return res.status(500).json({ message: err instanceof Error ? err.message : "Failed to find member" });
		}
	});

	// plans
	app.get("/api/plans", async (_req: Request, res: Response) => {
		const items = await storage.listPlans();
		return jsonOk(res, items);
	});

	app.get("/api/plans/:id", async (req: Request, res: Response) => {
		const plan = await storage.getPlan(req.params.id);
		if (!plan) return res.status(404).json({ message: "Not found" });
		return jsonOk(res, plan);
	});

	app.post("/api/plans", async (req: Request, res: Response, next: NextFunction) => {
		try {
			const data = insertPlanSchema.parse(req.body);
			const created = await storage.createPlan(data);
			return jsonOk(res, created, 201);
		} catch (err) {
			next(err);
		}
	});

	app.patch("/api/plans/:id", async (req: Request, res: Response, next: NextFunction) => {
		try {
			const updated = await storage.updatePlan(req.params.id, req.body ?? {});
			if (!updated) return res.status(404).json({ message: "Not found" });
			return jsonOk(res, updated);
		} catch (err) {
			next(err);
		}
	});

	app.delete("/api/plans/:id", async (req: Request, res: Response) => {
		const ok = await storage.deletePlan(req.params.id);
		if (!ok) return res.status(404).json({ message: "Not found" });
		return res.status(204).end();
	});


	// health: verify DB connectivity quickly
	app.get("/api/health", async (_req: Request, res: Response) => {
		try {
			const [members, payments, attendance] = await Promise.all([
				storage.listMembers(),
				storage.listPayments(),
				storage.listAttendance(),
			]);
			return jsonOk(res, {
				ok: true,
				db: "turso",
				counts: {
					members: members.length,
					payments: payments.length,
					attendance: attendance.length,
				},
			});
		} catch (e: any) {
			return res.status(500).json({ ok: false, message: e?.message ?? "DB error" });
		}
	});

	// WhatsApp endpoints
	app.post("/api/whatsapp/send-bulk", async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { template, memberIds, allMembers } = req.body;

			if (!template || typeof template !== "string") {
				return res.status(400).json({ message: "Template is required and must be a string" });
			}

			// Get all members from DB
			const allMembersList = await storage.listMembers();

			// Filter: only members with paymentStatus = "pending" or "overdue" (unless allMembers is true)
			let filteredMembers = allMembersList;
			
			if (!allMembers) {
				filteredMembers = allMembersList.filter(
					(member) => member.paymentStatus === "pending" || member.paymentStatus === "overdue"
				);
			}

			// If memberIds provided, filter to only those members
			if (memberIds && Array.isArray(memberIds) && memberIds.length > 0) {
				filteredMembers = filteredMembers.filter((member) => memberIds.includes(member.id));
			}

			const results: Array<{ memberId: string; phone: string; status: string }> = [];
			const db = getDb();

			// Process each member
			for (const member of filteredMembers) {
				try {
					// Format phone (remove non-digits)
					const formattedPhone = formatPhoneNumber(member.phone);

					if (!formattedPhone) {
						results.push({
							memberId: member.id,
							phone: member.phone,
							status: "failed - invalid phone",
						});
						// Log to database
						await db.execute({
							sql: `INSERT INTO whatsapp_logs (id, member_id, phone, message, status, sent_at, error_message) VALUES (?, ?, ?, ?, ?, ?, ?)`,
							args: [
								randomUUID(),
								member.id,
								member.phone,
								template,
								"failed",
								new Date().toISOString(),
								"Invalid phone number",
							],
						});
						continue;
					}

					// Calculate days left
					let daysLeft = 0;
					try {
						if (member.expiryDate) {
							daysLeft = calculateDaysLeft(member.expiryDate);
						}
					} catch (err) {
						// If date calculation fails, default to 0
						daysLeft = 0;
					}

					// Replace {name}, {plan}, {daysLeft} in template
					const personalizedMessage = template
						.replace(/{name}/g, member.name || "Member")
						.replace(/{plan}/g, member.planName || "No Plan")
						.replace(/{daysLeft}/g, daysLeft.toString());

					// Send via sendWhatsAppMessage()
					const sendResult = await sendWhatsAppMessage(formattedPhone, personalizedMessage);

					const status = sendResult.success ? "sent" : "failed";

					// Log to whatsapp_logs table
					await db.execute({
						sql: `INSERT INTO whatsapp_logs (id, member_id, phone, message, status, sent_at, error_message) VALUES (?, ?, ?, ?, ?, ?, ?)`,
						args: [
							randomUUID(),
							member.id,
							formattedPhone,
							personalizedMessage,
							status,
							new Date().toISOString(),
							sendResult.error || null,
						],
					});

					results.push({
						memberId: member.id,
						phone: formattedPhone,
						status,
					});

					// 2 second delay between each
					if (filteredMembers.indexOf(member) < filteredMembers.length - 1) {
						await new Promise((resolve) => setTimeout(resolve, 2000));
					}
				} catch (err) {
					const errorMessage = err instanceof Error ? err.message : "Unknown error";
					results.push({
						memberId: member.id,
						phone: member.phone,
						status: `failed - ${errorMessage}`,
					});

					// Log error to database
					try {
						await db.execute({
							sql: `INSERT INTO whatsapp_logs (id, member_id, phone, message, status, sent_at, error_message) VALUES (?, ?, ?, ?, ?, ?, ?)`,
							args: [
								randomUUID(),
								member.id,
								member.phone,
								template,
								"failed",
								new Date().toISOString(),
								errorMessage,
							],
						});
					} catch (logErr) {
						console.error("Failed to log WhatsApp error:", logErr);
					}
				}
			}

			return jsonOk(res, { success: true, results });
		} catch (err) {
			next(err);
		}
	});

	app.post("/api/whatsapp/test-template", async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { template } = req.body;

			if (!template || typeof template !== "string") {
				return res.status(400).json({ message: "Template is required and must be a string" });
			}

			// Get first 3 members
			const allMembers = await storage.listMembers();
			const sampleMembers = allMembers.slice(0, 3);

			const samples = sampleMembers.map((member) => {
				// Format phone (remove non-digits)
				const formattedPhone = formatPhoneNumber(member.phone);

				// Calculate days left
				let daysLeft = 0;
				try {
					if (member.expiryDate) {
						daysLeft = calculateDaysLeft(member.expiryDate);
					}
				} catch (err) {
					daysLeft = 0;
				}

				// Replace {name}, {plan}, {daysLeft} in template
				const preview = template
					.replace(/{name}/g, member.name || "Member")
					.replace(/{plan}/g, member.planName || "No Plan")
					.replace(/{daysLeft}/g, daysLeft.toString());

				return {
					name: member.name,
					phone: formattedPhone,
					preview,
				};
			});

			return jsonOk(res, { samples });
		} catch (err) {
			next(err);
		}
	});

	app.get("/api/whatsapp/status", async (_req: Request, res: Response) => {
		try {
			return jsonOk(res, {
				connected: isWAConnected,
				qr: currentQR || null,
			});
		} catch (err) {
			return res.status(500).json({
				message: err instanceof Error ? err.message : "Failed to get WhatsApp status",
			});
		}
	});
}
