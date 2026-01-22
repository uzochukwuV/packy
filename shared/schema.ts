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

// Rounds table - stores round information synced from blockchain
export const rounds = pgTable("rounds", {
  id: serial("id").primaryKey(),
  roundId: varchar("round_id", { length: 100 }).notNull().unique(), // Blockchain round ID
  seasonId: varchar("season_id", { length: 100 }).notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"), // When round ended (15 mins after start)
  vrfRequestId: varchar("vrf_request_id", { length: 100 }),
  vrfFulfilledAt: timestamp("vrf_fulfilled_at"),
  settled: boolean("settled").notNull().default(false),
  settledAt: timestamp("settled_at"),
  isActive: boolean("is_active").notNull().default(true), // Whether betting is still allowed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertRoundSchema = createInsertSchema(rounds).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type Round = typeof rounds.$inferSelect;
export type InsertRound = z.infer<typeof insertRoundSchema>;

// Matches table - stores match results from blockchain
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  roundId: varchar("round_id", { length: 100 }).notNull(),
  matchIndex: integer("match_index").notNull(), // 0-9 for each round
  homeTeamId: integer("home_team_id").notNull(),
  awayTeamId: integer("away_team_id").notNull(),
  homeTeamName: varchar("home_team_name", { length: 100 }).notNull(),
  awayTeamName: varchar("away_team_name", { length: 100 }).notNull(),
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  outcome: varchar("outcome", { length: 20 }).notNull().default("pending"), // pending, home_win, away_win, draw
  homeOdds: varchar("home_odds", { length: 100 }), // Initial odds
  awayOdds: varchar("away_odds", { length: 100 }),
  drawOdds: varchar("draw_odds", { length: 100 }),
  settled: boolean("settled").notNull().default(false),
  settledAt: timestamp("settled_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type Match = typeof matches.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;

// Points table - tracks testnet user rewards
export const userPoints = pgTable("user_points", {
  id: serial("id").primaryKey(),
  walletAddress: varchar("wallet_address", { length: 42 }).notNull().unique(),
  totalPoints: integer("total_points").notNull().default(0),
  betsPlaced: integer("bets_placed").notNull().default(0), // Total bets placed
  betsWon: integer("bets_won").notNull().default(0), // Total bets won
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserPointsSchema = createInsertSchema(userPoints).omit({
  id: true,
  createdAt: true,
  lastUpdated: true
});

export type UserPoints = typeof userPoints.$inferSelect;
export type InsertUserPoints = z.infer<typeof insertUserPointsSchema>;

// Points history table - tracks individual point transactions
export const pointsHistory = pgTable("points_history", {
  id: serial("id").primaryKey(),
  walletAddress: varchar("wallet_address", { length: 42 }).notNull(),
  betId: varchar("bet_id", { length: 100 }), // Optional - related bet if applicable
  points: integer("points").notNull(), // Points awarded (1 for bet placed, 10 for win)
  reason: varchar("reason", { length: 50 }).notNull(), // 'bet_placed' or 'bet_won'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPointsHistorySchema = createInsertSchema(pointsHistory).omit({
  id: true,
  createdAt: true
});

export type PointsHistory = typeof pointsHistory.$inferSelect;
export type InsertPointsHistory = z.infer<typeof insertPointsHistorySchema>;
