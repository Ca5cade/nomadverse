import { db } from "./db";
import { users, projects, files, type InsertProject, type Project, type InsertFile, type File, type InsertUser, type User } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Users
  createUser(userData: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;

  // Projects
  getProject(id: string, userId: string): Promise<Project | undefined>;
  getProjects(userId: string): Promise<Project[]>;
  createProject(project: InsertProject, userId: string): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>, userId: string): Promise<Project | undefined>;
  deleteProject(id: string, userId: string): Promise<boolean>;

  // Files
  getFile(id: string, userId: string): Promise<File | undefined>;
  getFilesByProject(projectId: string, userId: string): Promise<File[]>;
  createFile(file: InsertFile, userId: string): Promise<File>;
  updateFile(id: string, updates: Partial<File>, userId: string): Promise<File | undefined>;
  deleteFile(id: string, userId: string): Promise<boolean>;
}

class DrizzleStorage implements IStorage {
  async createUser(userData: InsertUser): Promise<User> {
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async getUserById(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getProject(id: string, userId: string): Promise<Project | undefined> {
    const result = await db.select().from(projects).where(and(eq(projects.id, id), eq(projects.userId, userId)));
    return result[0];
  }

  async getProjects(userId: string): Promise<Project[]> {
    return db.select().from(projects).where(eq(projects.userId, userId));
  }

  async createProject(projectData: InsertProject, userId: string): Promise<Project> {
    const result = await db.insert(projects).values({ ...projectData, userId }).returning();
    return result[0];
  }

  async updateProject(id: string, updates: Partial<Project>, userId: string): Promise<Project | undefined> {
    // First, verify the user owns the project
    const project = await this.getProject(id, userId);
    if (!project) {
      return undefined;
    }

    const result = await db.update(projects).set({ ...updates, updatedAt: new Date() }).where(eq(projects.id, id)).returning();
    return result[0];
  }

  async deleteProject(id: string, userId: string): Promise<boolean> {
    // First, verify the user owns the project
    const project = await this.getProject(id, userId);
    if (!project) {
      return false;
    }

    await db.delete(projects).where(eq(projects.id, id));
    return true;
  }

  // Helper to check file ownership by joining with projects table
  private async userOwnsFile(fileId: string, userId: string): Promise<boolean> {
    const result = await db.select({ projectId: projects.id })
      .from(files)
      .leftJoin(projects, eq(files.projectId, projects.id))
      .where(and(eq(files.id, fileId), eq(projects.userId, userId)));
    return result.length > 0;
  }

  async getFile(id: string, userId: string): Promise<File | undefined> {
    const ownFile = await this.userOwnsFile(id, userId);
    if (!ownFile) return undefined;

    const result = await db.select().from(files).where(eq(files.id, id));
    return result[0];
  }

  async getFilesByProject(projectId: string, userId: string): Promise<File[]> {
    // First, verify the user owns the project
    const project = await this.getProject(projectId, userId);
    if (!project) {
      return [];
    }
    return db.select().from(files).where(eq(files.projectId, projectId));
  }

  async createFile(fileData: InsertFile, userId: string): Promise<File> {
    // First, verify the user owns the project
    const project = await this.getProject(fileData.projectId, userId);
    if (!project) {
      throw new Error("Project not found or user does not have access");
    }

    const result = await db.insert(files).values(fileData).returning();
    return result[0];
  }

  async updateFile(id: string, updates: Partial<File>, userId: string): Promise<File | undefined> {
    const ownFile = await this.userOwnsFile(id, userId);
    if (!ownFile) return undefined;

    const result = await db.update(files).set(updates).where(eq(files.id, id)).returning();
    return result[0];
  }

  async deleteFile(id: string, userId: string): Promise<boolean> {
    const ownFile = await this.userOwnsFile(id, userId);
    if (!ownFile) return false;

    await db.delete(files).where(eq(files.id, id));
    return true;
  }
}

export const storage = new DrizzleStorage();