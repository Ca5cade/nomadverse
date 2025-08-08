import { type Project, type InsertProject, type File, type InsertFile } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Projects
  getProject(id: string): Promise<Project | undefined>;
  getProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;

  // Files
  getFile(id: string): Promise<File | undefined>;
  getFilesByProject(projectId: string): Promise<File[]>;
  createFile(file: InsertFile): Promise<File>;
  updateFile(id: string, updates: Partial<File>): Promise<File | undefined>;
  deleteFile(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private projects: Map<string, Project>;
  private files: Map<string, File>;

  constructor() {
    this.projects = new Map();
    this.files = new Map();
    
    // Initialize with a sample project
    const sampleProjectId = randomUUID();
    const sampleProject: Project = {
      id: sampleProjectId,
      name: "My First Robot",
      description: "A simple robot movement program",
      blocks: [],
      pythonCode: "# Generated from visual blocks\nimport robot\nimport time\n\ndef main():\n    robot.move_forward(10)\n    for i in range(5):\n        robot.turn_right(90)\n\nif __name__ == \"__main__\":\n    main()",
      sceneConfig: {
        objects: [
          {
            id: "robot-1",
            type: "robot" as const,
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            color: "#3B82F6"
          }
        ],
        environment: {
          lighting: "default",
          gravity: 9.8
        }
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.set(sampleProjectId, sampleProject);

    // Add sample files
    const files = [
      {
        id: randomUUID(),
        projectId: sampleProjectId,
        name: "main.py",
        type: "python",
        content: sampleProject.pythonCode,
        path: "/main.py"
      },
      {
        id: randomUUID(),
        projectId: sampleProjectId,
        name: "blocks.scratch",
        type: "blocks",
        content: "[]",
        path: "/blocks.scratch"
      },
      {
        id: randomUUID(),
        projectId: sampleProjectId,
        name: "scene.world",
        type: "scene",
        content: JSON.stringify(sampleProject.sceneConfig),
        path: "/scene.world"
      }
    ];

    files.forEach(file => this.files.set(file.id, file));
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const now = new Date();
    const project: Project = {
      ...insertProject,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const existing = this.projects.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: string): Promise<boolean> {
    // Also delete associated files
    const projectFiles = Array.from(this.files.values()).filter(f => f.projectId === id);
    projectFiles.forEach(file => this.files.delete(file.id));
    
    return this.projects.delete(id);
  }

  async getFile(id: string): Promise<File | undefined> {
    return this.files.get(id);
  }

  async getFilesByProject(projectId: string): Promise<File[]> {
    return Array.from(this.files.values()).filter(f => f.projectId === projectId);
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const id = randomUUID();
    const file: File = { ...insertFile, id };
    this.files.set(id, file);
    return file;
  }

  async updateFile(id: string, updates: Partial<File>): Promise<File | undefined> {
    const existing = this.files.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates };
    this.files.set(id, updated);
    return updated;
  }

  async deleteFile(id: string): Promise<boolean> {
    return this.files.delete(id);
  }
}

export const storage = new MemStorage();
