import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Project, InsertProject } from "@shared/schema";
import { useAuth } from "./use-auth";

export function useProjects() {
  const { user } = useAuth();
  return useQuery<Project[]>({
    queryKey: ['/api/projects', user?.id],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/projects');
      return response.json();
    },
    enabled: !!user,
  });
}

export function useProject(id: string | null) {
  const { user } = useAuth();
  return useQuery<Project>({
    queryKey: ['/api/projects', id, user?.id],
    queryFn: async () => {
      if (!id) return null;
      const response = await apiRequest('GET', `/api/projects/${id}`);
      if (!response.ok) {
        // You might want to handle different statuses differently
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch project');
      }
      return response.json();
    },
    enabled: !!id && !!user,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: InsertProject) => {
      const response = await apiRequest('POST', '/api/projects', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', user?.id] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Project> }) => {
      const response = await apiRequest('PATCH', `/api/projects/${id}`, updates);
      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', id, user?.id] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', user?.id] });
    },
  });
}
