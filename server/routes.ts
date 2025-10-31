import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, type WebSocket } from "ws";
import { randomUUID } from "crypto";
import { storage } from "./storage";
import { insertMemberSchema, insertPaymentSchema, insertEquipmentSchema, insertAttendanceSchema } from "@shared/schema";

// Lightweight in-memory event bus for SSE
type EventMessage = { type: string; payload: unknown };
class EventBus {
	private subscribers: Set<Response> = new Set();

	subscribe(res: Response) {
		this.subscribers.add(res);
		res.on("close", () => {
			this.subscribers.delete(res);
		});
	}

	publish(type: string, payload: unknown) {
		const data: EventMessage = { type, payload };
		const frame = `data: ${JSON.stringify(data)}\n\n`;
		this.subscribers.forEach((res) => {
			res.write(frame);
		});
	}
}

export const events = new EventBus();

export async function registerRoutes(app: Express): Promise<Server> {
	// helper
	const jsonOk = (res: Response, body: unknown, status = 200) => res.status(status).json(body);

	// SSE endpoint
app.get("/api/events", (req: Request, res: Response) => {
		res.setHeader("Content-Type", "text/event-stream");
		res.setHeader("Cache-Control", "no-cache");
		res.setHeader("Connection", "keep-alive");
		res.flushHeaders?.();
		res.write(`event: connected\n`);
		res.write(`data: ${JSON.stringify({ ok: true })}\n\n`);
		events.subscribe(res);
	});

	// members
app.get("/api/members", async (_req: Request, res: Response) => {
		const items = await storage.listMembers();
		return jsonOk(res, items);
	});

app.post("/api/members", async (req: Request, res: Response, next: NextFunction) => {
		try {
			const data = insertMemberSchema.parse(req.body);
			const created = await storage.createMember(data);
			events.publish("member.created", created);
			return jsonOk(res, created, 201);
		} catch (err) {
			next(err);
		}
	});

app.patch("/api/members/:id", async (req: Request, res: Response) => {
		const updated = await storage.updateMember(req.params.id, req.body ?? {});
		if (!updated) return res.status(404).json({ message: "Not found" });
		events.publish("member.updated", updated);
		return jsonOk(res, updated);
	});

app.delete("/api/members/:id", async (req: Request, res: Response) => {
		const ok = await storage.deleteMember(req.params.id);
		if (!ok) return res.status(404).json({ message: "Not found" });
		events.publish("member.deleted", { id: req.params.id });
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
			events.publish("payment.created", created);
			return jsonOk(res, created, 201);
		} catch (err) {
			next(err);
		}
	});

app.patch("/api/payments/:id", async (req: Request, res: Response) => {
		const updated = await storage.updatePayment(req.params.id, req.body ?? {});
		if (!updated) return res.status(404).json({ message: "Not found" });
		events.publish("payment.updated", updated);
		return jsonOk(res, updated);
	});

app.delete("/api/payments/:id", async (req: Request, res: Response) => {
		const ok = await storage.deletePayment(req.params.id);
		if (!ok) return res.status(404).json({ message: "Not found" });
		events.publish("payment.deleted", { id: req.params.id });
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
			events.publish("equipment.created", created);
			return jsonOk(res, created, 201);
		} catch (err) {
			next(err);
		}
	});

app.patch("/api/equipment/:id", async (req: Request, res: Response) => {
		const updated = await storage.updateEquipment(req.params.id, req.body ?? {});
		if (!updated) return res.status(404).json({ message: "Not found" });
		events.publish("equipment.updated", updated);
		return jsonOk(res, updated);
	});

app.delete("/api/equipment/:id", async (req: Request, res: Response) => {
		const ok = await storage.deleteEquipment(req.params.id);
		if (!ok) return res.status(404).json({ message: "Not found" });
		events.publish("equipment.deleted", { id: req.params.id });
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
			events.publish("attendance.created", created);
			return jsonOk(res, created, 201);
		} catch (err) {
			next(err);
		}
	});

app.patch("/api/attendance/:id", async (req: Request, res: Response) => {
		const updated = await storage.updateAttendance(req.params.id, req.body ?? {});
		if (!updated) return res.status(404).json({ message: "Not found" });
		events.publish("attendance.updated", updated);
		return jsonOk(res, updated);
	});

app.delete("/api/attendance/:id", async (req: Request, res: Response) => {
		const ok = await storage.deleteAttendance(req.params.id);
		if (!ok) return res.status(404).json({ message: "Not found" });
		events.publish("attendance.deleted", { id: req.params.id });
		return res.status(204).end();
	});

	const httpServer = createServer(app);

	return httpServer;
}
