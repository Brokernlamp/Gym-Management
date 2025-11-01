import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { insertMemberSchema, insertPaymentSchema, insertEquipmentSchema, insertAttendanceSchema, settingsSchema } from "@shared/schema";

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
		return jsonOk(res, created, 201);
		} catch (err) {
			next(err);
		}
	});

app.patch("/api/members/:id", async (req: Request, res: Response) => {
		const updated = await storage.updateMember(req.params.id, req.body ?? {});
		if (!updated) return res.status(404).json({ message: "Not found" });
		return jsonOk(res, updated);
	});

app.delete("/api/members/:id", async (req: Request, res: Response) => {
		const ok = await storage.deleteMember(req.params.id);
		if (!ok) return res.status(404).json({ message: "Not found" });
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
}
