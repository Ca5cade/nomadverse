import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  blocks: jsonb("blocks").default('[]'),
  pythonCode: text("python_code").default(''),
  sceneConfig: jsonb("scene_config").default('{}'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const files = pgTable("files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'python', 'blocks', 'scene'
  content: text("content").default(''),
  path: text("path").notNull(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
});

export const blockSchema = z.object({
  id: z.string(),
  type: z.string(),
  category: z.enum(['motion', 'control', 'sensing', 'events']),
  x: z.number(),
  y: z.number(),
  inputs: z.record(z.any()).optional(),
  children: z.array(z.string()).optional(),
});

export const sceneConfigSchema = z.object({
  objects: z.array(z.object({
    id: z.string(),
    type: z.enum(['cube', 'sphere', 'cylinder', 'robot']),
    position: z.object({ x: z.number(), y: z.number(), z: z.number() }),
    rotation: z.object({ x: z.number(), y: z.number(), z: z.number() }),
    scale: z.object({ x: z.number(), y: z.number(), z: z.number() }),
    color: z.string().optional(),
  })),
  environment: z.object({
    lighting: z.string().optional(),
    gravity: z.number().optional(),
  }).optional(),
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;
export type File = typeof files.$inferSelect;
export type Block = z.infer<typeof blockSchema>;
export type SceneConfig = z.infer<typeof sceneConfigSchema>;
