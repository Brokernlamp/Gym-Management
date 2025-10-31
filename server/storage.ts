import {
  type User,
  type InsertUser,
  type Member,
  type InsertMember,
  type Payment,
  type InsertPayment,
  type Equipment,
  type InsertEquipment,
  type Attendance,
  type InsertAttendance,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { getDb } from "./db";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // members
  listMembers(): Promise<Member[]>;
  getMember(id: string): Promise<Member | undefined>;
  createMember(member: InsertMember): Promise<Member>;
  updateMember(id: string, member: Partial<InsertMember>): Promise<Member | undefined>;
  deleteMember(id: string): Promise<boolean>;

  // payments
  listPayments(): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, payment: Partial<InsertPayment>): Promise<Payment | undefined>;
  deletePayment(id: string): Promise<boolean>;

  // equipment
  listEquipment(): Promise<Equipment[]>;
  createEquipment(equipment: InsertEquipment): Promise<Equipment>;
  updateEquipment(id: string, equipment: Partial<InsertEquipment>): Promise<Equipment | undefined>;
  deleteEquipment(id: string): Promise<boolean>;

  // attendance
  listAttendance(): Promise<Attendance[]>;
  createAttendance(record: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: string, record: Partial<InsertAttendance>): Promise<Attendance | undefined>;
  deleteAttendance(id: string): Promise<boolean>;
}

export class TursoStorage implements IStorage {
  private db = getDb();

  async getUser(id: string): Promise<User | undefined> {
    const r = await this.db.execute({ sql: `SELECT id, username, password FROM users WHERE id = ?`, args: [id] });
    return r.rows[0] as any;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const r = await this.db.execute({ sql: `SELECT id, username, password FROM users WHERE username = ?`, args: [username] });
    return r.rows[0] as any;
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = randomUUID();
    await this.db.execute({ sql: `INSERT INTO users (id, username, password) VALUES (?, ?, ?)`, args: [id, user.username, user.password] });
    return { id, username: user.username, password: user.password } as any;
  }

  async listMembers(): Promise<Member[]> {
    const r = await this.db.execute(`SELECT * FROM members ORDER BY name`);
    return r.rows as any;
  }

  async getMember(id: string): Promise<Member | undefined> {
    const r = await this.db.execute({ sql: `SELECT * FROM members WHERE id = ?`, args: [id] });
    return r.rows[0] as any;
  }

  async createMember(member: InsertMember): Promise<Member> {
    const id = randomUUID();
    await this.db.execute({
      sql: `INSERT INTO members (
        id, name, email, phone, photo_url, login_code, plan_id, plan_name,
        start_date, expiry_date, status, payment_status, last_check_in,
        emergency_contact, trainer_id, notes, gender, age
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        member.name,
        member.email,
        member.phone,
        (member as any).photoUrl ?? null,
        member.loginCode,
        (member as any).planId ?? null,
        (member as any).planName ?? null,
        (member as any).startDate ?? null,
        (member as any).expiryDate ?? null,
        member.status,
        (member as any).paymentStatus,
        (member as any).lastCheckIn ?? null,
        (member as any).emergencyContact ?? null,
        (member as any).trainerId ?? null,
        (member as any).notes ?? null,
        (member as any).gender ?? null,
        (member as any).age ?? null,
      ],
    });
    const created = await this.getMember(id);
    return created as Member;
  }

  async updateMember(id: string, member: Partial<InsertMember>): Promise<Member | undefined> {
    const current = await this.getMember(id);
    if (!current) return undefined;
    const updated = { ...current, ...member } as any;
    await this.db.execute({
      sql: `UPDATE members SET name=?, email=?, phone=?, photo_url=?, login_code=?, plan_id=?, plan_name=?, start_date=?, expiry_date=?, status=?, payment_status=?, last_check_in=?, emergency_contact=?, trainer_id=?, notes=?, gender=?, age=? WHERE id=?`,
      args: [
        updated.name,
        updated.email,
        updated.phone,
        updated.photoUrl ?? null,
        updated.loginCode,
        updated.planId ?? null,
        updated.planName ?? null,
        updated.startDate ?? null,
        updated.expiryDate ?? null,
        updated.status,
        updated.paymentStatus,
        updated.lastCheckIn ?? null,
        updated.emergencyContact ?? null,
        updated.trainerId ?? null,
        updated.notes ?? null,
        updated.gender ?? null,
        updated.age ?? null,
        id,
      ],
    });
    return await this.getMember(id);
  }

  async deleteMember(id: string): Promise<boolean> {
    const r = await this.db.execute({ sql: `DELETE FROM members WHERE id = ?`, args: [id] });
    return (r.rowsAffected ?? 0) > 0;
  }

  async listPayments(): Promise<Payment[]> {
    const r = await this.db.execute(`SELECT * FROM payments ORDER BY COALESCE(paid_date, due_date) DESC`);
    return r.rows as any;
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const id = randomUUID();
    await this.db.execute({
      sql: `INSERT INTO payments (id, member_id, amount, payment_method, status, due_date, paid_date, plan_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        payment.memberId,
        String((payment as any).amount ?? "0"),
        (payment as any).paymentMethod,
        (payment as any).status,
        (payment as any).dueDate ?? null,
        (payment as any).paidDate ?? null,
        (payment as any).planName ?? null,
      ],
    });
    const r = await this.db.execute({ sql: `SELECT * FROM payments WHERE id = ?`, args: [id] });
    return r.rows[0] as any;
  }

  async updatePayment(id: string, payment: Partial<InsertPayment>): Promise<Payment | undefined> {
    const current = await this.db.execute({ sql: `SELECT * FROM payments WHERE id = ?`, args: [id] });
    const cur = current.rows[0] as any;
    if (!cur) return undefined;
    const updated = { ...cur, ...payment } as any;
    await this.db.execute({
      sql: `UPDATE payments SET member_id=?, amount=?, payment_method=?, status=?, due_date=?, paid_date=?, plan_name=? WHERE id=?`,
      args: [
        updated.memberId,
        String(updated.amount ?? "0"),
        updated.paymentMethod,
        updated.status,
        updated.dueDate ?? null,
        updated.paidDate ?? null,
        updated.planName ?? null,
        id,
      ],
    });
    const r = await this.db.execute({ sql: `SELECT * FROM payments WHERE id = ?`, args: [id] });
    return r.rows[0] as any;
  }

  async deletePayment(id: string): Promise<boolean> {
    const r = await this.db.execute({ sql: `DELETE FROM payments WHERE id = ?`, args: [id] });
    return (r.rowsAffected ?? 0) > 0;
  }

  async listEquipment(): Promise<Equipment[]> {
    const r = await this.db.execute(`SELECT * FROM equipment ORDER BY name`);
    return r.rows as any;
  }

  async createEquipment(equipment: InsertEquipment): Promise<Equipment> {
    const id = randomUUID();
    await this.db.execute({
      sql: `INSERT INTO equipment (id, name, category, purchase_date, warranty_expiry, last_maintenance, next_maintenance, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        equipment.name,
        (equipment as any).category,
        (equipment as any).purchaseDate ?? null,
        (equipment as any).warrantyExpiry ?? null,
        (equipment as any).lastMaintenance ?? null,
        (equipment as any).nextMaintenance ?? null,
        (equipment as any).status,
      ],
    });
    const r = await this.db.execute({ sql: `SELECT * FROM equipment WHERE id = ?`, args: [id] });
    return r.rows[0] as any;
  }

  async updateEquipment(id: string, equipment: Partial<InsertEquipment>): Promise<Equipment | undefined> {
    const current = await this.db.execute({ sql: `SELECT * FROM equipment WHERE id = ?`, args: [id] });
    const cur = current.rows[0] as any;
    if (!cur) return undefined;
    const updated = { ...cur, ...equipment } as any;
    await this.db.execute({
      sql: `UPDATE equipment SET name=?, category=?, purchase_date=?, warranty_expiry=?, last_maintenance=?, next_maintenance=?, status=? WHERE id=?`,
      args: [
        updated.name,
        updated.category,
        updated.purchaseDate ?? null,
        updated.warrantyExpiry ?? null,
        updated.lastMaintenance ?? null,
        updated.nextMaintenance ?? null,
        updated.status,
        id,
      ],
    });
    const r = await this.db.execute({ sql: `SELECT * FROM equipment WHERE id = ?`, args: [id] });
    return r.rows[0] as any;
  }

  async deleteEquipment(id: string): Promise<boolean> {
    const r = await this.db.execute({ sql: `DELETE FROM equipment WHERE id = ?`, args: [id] });
    return (r.rowsAffected ?? 0) > 0;
  }

  async listAttendance(): Promise<Attendance[]> {
    const r = await this.db.execute(`SELECT * FROM attendance ORDER BY COALESCE(check_out_time, check_in_time) DESC`);
    return r.rows as any;
  }

  async createAttendance(record: InsertAttendance): Promise<Attendance> {
    const id = randomUUID();
    await this.db.execute({
      sql: `INSERT INTO attendance (id, member_id, check_in_time, check_out_time, latitude, longitude, marked_via) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        record.memberId,
        (record as any).checkInTime ?? new Date().toISOString(),
        (record as any).checkOutTime ?? null,
        (record as any).latitude ?? null,
        (record as any).longitude ?? null,
        (record as any).markedVia ?? "manual",
      ],
    });
    const r = await this.db.execute({ sql: `SELECT * FROM attendance WHERE id = ?`, args: [id] });
    return r.rows[0] as any;
  }

  async updateAttendance(id: string, record: Partial<InsertAttendance>): Promise<Attendance | undefined> {
    const current = await this.db.execute({ sql: `SELECT * FROM attendance WHERE id = ?`, args: [id] });
    const cur = current.rows[0] as any;
    if (!cur) return undefined;
    const updated = { ...cur, ...record } as any;
    await this.db.execute({
      sql: `UPDATE attendance SET member_id=?, check_in_time=?, check_out_time=?, latitude=?, longitude=?, marked_via=? WHERE id=?`,
      args: [
        updated.memberId,
        updated.checkInTime ?? cur.check_in_time,
        updated.checkOutTime ?? null,
        updated.latitude ?? null,
        updated.longitude ?? null,
        updated.markedVia ?? cur.marked_via,
        id,
      ],
    });
    const r = await this.db.execute({ sql: `SELECT * FROM attendance WHERE id = ?`, args: [id] });
    return r.rows[0] as any;
  }

  async deleteAttendance(id: string): Promise<boolean> {
    const r = await this.db.execute({ sql: `DELETE FROM attendance WHERE id = ?`, args: [id] });
    return (r.rowsAffected ?? 0) > 0;
  }
}

export const storage = new TursoStorage();
