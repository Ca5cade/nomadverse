import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import passport from "./auth";
import bcrypt from 'bcrypt';
import { storage } from "./storage";
import { insertProjectSchema, insertFileSchema, insertUserSchema, User } from "@shared/schema";
import { z } from "zod";

// Middleware to check if the user is authenticated
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

export async function registerRoutes(app: Express): Promise<Server> {

  // Authentication routes
  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const { email, password } = z.object({
        email: z.string().email(),
        password: z.string().min(8, "Password must be at least 8 characters long."),
      }).parse(req.body);

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "An account with this email already exists." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({ email, hashedPassword });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid registration data", errors: error.errors });
      }
      next(error);
    }
  });

  app.post("/api/auth/login", passport.authenticate('local'), (req, res) => {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    res.json(req.user);
  });

  app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) { return next(err); }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json(null);
    }
  });

  // Projects routes (now protected and user-specific)
  app.get("/api/projects", isAuthenticated, async (req, res) => {
    const userId = (req.user as User).id;
    const projects = await storage.getProjects(userId);
    res.json(projects);
  });

  app.get("/api/projects/:id", isAuthenticated, async (req, res) => {
    const userId = (req.user as User).id;
    const project = await storage.getProject(req.params.id, userId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  });

  app.post("/api/projects", isAuthenticated, async (req, res) => {
    const userId = (req.user as User).id;
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData, userId);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.patch("/api/projects/:id", isAuthenticated, async (req, res) => {
    const userId = (req.user as User).id;
    const updates = req.body;
    const project = await storage.updateProject(req.params.id, updates, userId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  });

  app.delete("/api/projects/:id", isAuthenticated, async (req, res) => {
    const userId = (req.user as User).id;
    const deleted = await storage.deleteProject(req.params.id, userId);
    if (!deleted) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json({ message: "Project deleted successfully" });
  });

  // Files routes (now protected and user-specific)
  app.get("/api/projects/:projectId/files", isAuthenticated, async (req, res) => {
    const userId = (req.user as User).id;
    const files = await storage.getFilesByProject(req.params.projectId, userId);
    res.json(files);
  });

  app.post("/api/files", isAuthenticated, async (req, res) => {
    const userId = (req.user as User).id;
    try {
      const fileData = insertFileSchema.parse(req.body);
      const file = await storage.createFile(fileData, userId);
      res.status(201).json(file);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid file data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create file" });
    }
  });

  app.patch("/api/files/:id", isAuthenticated, async (req, res) => {
    const userId = (req.user as User).id;
    const updates = req.body;
    const file = await storage.updateFile(req.params.id, updates, userId);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }
    res.json(file);
  });

  const httpServer = createServer(app);
  return httpServer;
}
