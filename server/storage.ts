import { db } from "./db";
import { users, type User, type InsertUser } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUserByWallet(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  async getUserByWallet(walletAddress: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
}

export const storage = new DatabaseStorage();
