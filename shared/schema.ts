import { pgTable, serial, varchar, timestamp, text, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  walletAddress: varchar("wallet_address", { length: 42 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export const bets = pgTable("bets", {
  id: serial("id").primaryKey(),
  betId: varchar("bet_id", { length: 100 }).notNull().unique(), // Blockchain bet ID
  bettor: varchar("bettor", { length: 42 }).notNull(), // User wallet address
  seasonId: varchar("season_id", { length: 100 }).notNull(),
  roundId: varchar("round_id", { length: 100 }).notNull(),
  amount: varchar("amount", { length: 100 }).notNull(), // Bet amount in wei (as string)
  matchIndices: text("match_indices").notNull(), // JSON array of match indices
  outcomes: text("outcomes").notNull(), // JSON array of outcomes (1=HOME, 2=AWAY, 3=DRAW)
  parlayMultiplier: varchar("parlay_multiplier", { length: 100 }).notNull(), // Multiplier as string
  potentialWinnings: varchar("potential_winnings", { length: 100 }).notNull(), // Potential return
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, won, lost, claimed
  txHash: varchar("tx_hash", { length: 66 }).notNull(), // Transaction hash
  placedAt: timestamp("placed_at").defaultNow(),
  settledAt: timestamp("settled_at"),
});

export const insertBetSchema = createInsertSchema(bets).omit({
  id: true,
  placedAt: true,
  settledAt: true
});

export type Bet = typeof bets.$inferSelect;
export type InsertBet = z.infer<typeof insertBetSchema>;
