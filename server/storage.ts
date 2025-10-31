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

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private members: Map<string, Member>;
  private payments: Map<string, Payment>;
  private equipments: Map<string, Equipment>;
  private attendance: Map<string, Attendance>;

  constructor() {
    this.users = new Map();
    this.members = new Map();
    this.payments = new Map();
    this.equipments = new Map();
    this.attendance = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // members
  async listMembers(): Promise<Member[]> {
    return Array.from(this.members.values());
  }

  async getMember(id: string): Promise<Member | undefined> {
    return this.members.get(id);
  }

  async createMember(member: InsertMember): Promise<Member> {
    const id = randomUUID();
    const created: Member = { ...member, id } as Member;
    this.members.set(id, created);
    return created;
  }

  async updateMember(id: string, member: Partial<InsertMember>): Promise<Member | undefined> {
    const current = this.members.get(id);
    if (!current) return undefined;
    const updated: Member = { ...current, ...member } as Member;
    this.members.set(id, updated);
    return updated;
  }

  async deleteMember(id: string): Promise<boolean> {
    return this.members.delete(id);
  }

  // payments
  async listPayments(): Promise<Payment[]> {
    return Array.from(this.payments.values());
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const id = randomUUID();
    const created: Payment = { ...payment, id } as Payment;
    this.payments.set(id, created);
    return created;
  }

  async updatePayment(id: string, payment: Partial<InsertPayment>): Promise<Payment | undefined> {
    const current = this.payments.get(id);
    if (!current) return undefined;
    const updated: Payment = { ...current, ...payment } as Payment;
    this.payments.set(id, updated);
    return updated;
  }

  async deletePayment(id: string): Promise<boolean> {
    return this.payments.delete(id);
  }

  // equipment
  async listEquipment(): Promise<Equipment[]> {
    return Array.from(this.equipments.values());
  }

  async createEquipment(equipment: InsertEquipment): Promise<Equipment> {
    const id = randomUUID();
    const created: Equipment = { ...equipment, id } as Equipment;
    this.equipments.set(id, created);
    return created;
  }

  async updateEquipment(id: string, equipment: Partial<InsertEquipment>): Promise<Equipment | undefined> {
    const current = this.equipments.get(id);
    if (!current) return undefined;
    const updated: Equipment = { ...current, ...equipment } as Equipment;
    this.equipments.set(id, updated);
    return updated;
  }

  async deleteEquipment(id: string): Promise<boolean> {
    return this.equipments.delete(id);
  }

  // attendance
  async listAttendance(): Promise<Attendance[]> {
    return Array.from(this.attendance.values());
  }

  async createAttendance(record: InsertAttendance): Promise<Attendance> {
    const id = randomUUID();
    const created: Attendance = { ...record, id } as Attendance;
    this.attendance.set(id, created);
    return created;
  }

  async updateAttendance(id: string, record: Partial<InsertAttendance>): Promise<Attendance | undefined> {
    const current = this.attendance.get(id);
    if (!current) return undefined;
    const updated: Attendance = { ...current, ...record } as Attendance;
    this.attendance.set(id, updated);
    return updated;
  }

  async deleteAttendance(id: string): Promise<boolean> {
    return this.attendance.delete(id);
  }
}

export const storage = new MemStorage();
