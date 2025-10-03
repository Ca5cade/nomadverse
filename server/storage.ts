import { type Project, type InsertProject, type File, type InsertFile, type User, type InsertUser, projects, files, users } from "@shared/schema";
import { db } from "./db";
import { and, eq } from "drizzle-orm";

export interface IStorage {
  // Users
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Projects
  getProject(id: string, userId: string): Promise<Project | undefined>;
  getProjects(userId: string): Promise<Project[]>;
  createProject(project: Omit<InsertProject, 'userId'>, userId: string): Promise<Project>;
  updateProject(id: string, userId: string, updates: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: string, userId: string): Promise<boolean>;

  // Files
  getFile(id: string): Promise<File | undefined>;
  getFilesByProject(projectId: string): Promise<File[]>;
  createFile(file: InsertFile): Promise<File>;
  updateFile(id: string, updates: Partial<File>): Promise<File | undefined>;
  deleteFile(id: string): Promise<boolean>;
}

export class DbStorage implements IStorage {
  async getUserById(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(user: Omit<InsertUser, 'username'>): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    const newUser = result[0];

    // Create a default project for the new user
    await this.createProject({
      name: 'My First Project',
      blocks: [],
      pythonCode: ''
    }, newUser.id);

    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  async getProject(id: string, userId: string): Promise<Project | undefined> {
    const result = await db.select().from(projects).where(and(eq(projects.id, id), eq(projects.userId, userId)));
    return result[0];
  }

  async getProjects(userId: string): Promise<Project[]> {
    return db.select().from(projects).where(eq(projects.userId, userId));
  }

  async createProject(project: Omit<InsertProject, 'userId'>, userId: string): Promise<Project> {
    const result = await db.insert(projects).values({ ...project, userId }).returning();
    return result[0];
  }

  async updateProject(id: string, userId: string, updates: Partial<Project>): Promise<Project | undefined> {
    const result = await db.update(projects).set(updates).where(and(eq(projects.id, id), eq(projects.userId, userId))).returning();
    return result[0];
  }

  async deleteProject(id: string, userId: string): Promise<boolean> {
    // First, ensure the project belongs to the user before deleting
    const project = await this.getProject(id, userId);
    if (!project) {
      return false;
    }
    await db.delete(files).where(eq(files.projectId, id));
    const result = await db.delete(projects).where(eq(projects.id, id)).returning();
    return result.length > 0;
  }

  async getFile(id: string): Promise<File | undefined> {
    const result = await db.select().from(files).where(eq(files.id, id));
    return result[0];
  }

  async getFilesByProject(projectId: string): Promise<File[]> {
    return db.select().from(files).where(eq(files.projectId, projectId));
  }

  async createFile(file: InsertFile): Promise<File> {
    const result = await db.insert(files).values(file).returning();
    return result[0];
  }

  async updateFile(id: string, updates: Partial<File>): Promise<File | undefined> {
    const result = await db.update(files).set(updates).where(eq(files.id, id)).returning();
    return result[0];
  }

  async deleteFile(id: string): Promise<boolean> {
    const result = await db.delete(files).where(eq(files.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DbStorage();