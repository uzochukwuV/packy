import { db } from "./db";
import { users, bets, type User, type InsertUser, type Bet, type InsertBet } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  getUserByWallet(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Bet operations
  saveBet(bet: InsertBet): Promise<Bet>;
  getBetByBetId(betId: string): Promise<Bet | undefined>;
  getUserBets(walletAddress: string, limit?: number, offset?: number): Promise<Bet[]>;
  getUserBetsByRound(walletAddress: string, roundId: string): Promise<Bet[]>;
  getUserBetsBySeason(walletAddress: string, seasonId: string): Promise<Bet[]>;
  updateBetStatus(betId: string, status: string, settledAt?: Date): Promise<Bet | undefined>;
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

  // ============ Bet Operations ============

  async saveBet(insertBet: InsertBet): Promise<Bet> {
    const [bet] = await db.insert(bets).values(insertBet).returning();
    return bet;
  }

  async getBetByBetId(betId: string): Promise<Bet | undefined> {
    const [bet] = await db.select().from(bets).where(eq(bets.betId, betId));
    return bet;
  }

  async getUserBets(walletAddress: string, limit: number = 50, offset: number = 0): Promise<Bet[]> {
    return db
      .select()
      .from(bets)
      .where(eq(bets.bettor, walletAddress))
      .orderBy(desc(bets.placedAt))
      .limit(limit)
      .offset(offset);
  }

  async getUserBetsByRound(walletAddress: string, roundId: string): Promise<Bet[]> {
    return db
      .select()
      .from(bets)
      .where(and(eq(bets.bettor, walletAddress), eq(bets.roundId, roundId)))
      .orderBy(desc(bets.placedAt));
  }

  async getUserBetsBySeason(walletAddress: string, seasonId: string): Promise<Bet[]> {
    return db
      .select()
      .from(bets)
      .where(and(eq(bets.bettor, walletAddress), eq(bets.seasonId, seasonId)))
      .orderBy(desc(bets.placedAt));
  }

  async updateBetStatus(betId: string, status: string, settledAt?: Date): Promise<Bet | undefined> {
    const [bet] = await db
      .update(bets)
      .set({
        status,
        settledAt: settledAt || new Date()
      })
      .where(eq(bets.betId, betId))
      .returning();
    return bet;
  }
}

export const storage = new DatabaseStorage();
