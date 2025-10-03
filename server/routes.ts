import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema, insertFileSchema, insertUserSchema, type User } from "@shared/schema";
import { z } from "zod";
import passport from "./auth";
import bcrypt from "bcrypt";

// Middleware to ensure a user is authenticated
const ensureAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Projects routes (all protected)
  app.get("/api/projects", ensureAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const projects = await storage.getProjects(user.id);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", ensureAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const project = await storage.getProject(req.params.id, user.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", ensureAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const projectData = insertProjectSchema.omit({ userId: true }).parse(req.body);
      const project = await storage.createProject(projectData, user.id);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.patch("/api/projects/:id", ensureAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const updates = req.body;
      const project = await storage.updateProject(req.params.id, user.id, updates);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", ensureAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const deleted = await storage.deleteProject(req.params.id, user.id);
      if (!deleted) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Files routes
  app.get("/api/projects/:projectId/files", async (req, res) => {
    try {
      const files = await storage.getFilesByProject(req.params.projectId);
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  app.post("/api/files", async (req, res) => {
    try {
      const fileData = insertFileSchema.parse(req.body);
      const file = await storage.createFile(fileData);
      res.status(201).json(file);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid file data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create file" });
    }
  });

  app.patch("/api/files/:id", async (req, res) => {
    try {
      const updates = req.body;
      const file = await storage.updateFile(req.params.id, updates);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      res.json(file);
    } catch (error) {
      res.status(500).json({ message: "Failed to update file" });
    }
  });

  // Auth routes
  app.post('/api/register', async (req, res, next) => {
    try {
      // Manually validate password to bypass potential Zod issue
      const { email } = insertUserSchema.pick({ email: true }).parse(req.body);
      const password = req.body.password;

      if (typeof password !== 'string' || password.length === 0) {
        throw new Error('Password is required and must be a non-empty string.');
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await storage.createUser({ email, hashedPassword });
      req.login(newUser, (err) => {
        if (err) return next(err);
        res.status(201).json(newUser);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      next(error);
    }
  });

  app.post('/api/login', passport.authenticate('local', {
    failureMessage: true
  }), (req, res) => {
    res.json(req.user);
  });

  app.post('/api/logout', (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/user', (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  });

  app.patch('/api/user', ensureAuthenticated, async (req, res, next) => {
    try {
      const user = req.user as User;
      const { currentCourseIndex, courseCompletions } = req.body;
      
      const updates: Partial<User> = {};
      if (currentCourseIndex !== undefined) {
        updates.currentCourseIndex = currentCourseIndex;
      }
      if (courseCompletions !== undefined) {
        updates.courseCompletions = courseCompletions;
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: 'No valid fields to update' });
      }

      const updatedUser = await storage.updateUser(user.id, updates);
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}