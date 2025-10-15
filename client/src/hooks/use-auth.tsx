import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type User, insertUserSchema } from '../../shared/schema';
import { z } from 'zod';

// Define the correct type for registration details
type RegisterDetails = z.infer<typeof insertUserSchema>;

// Define the shape of the authentication context
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: Pick<RegisterDetails, 'email' | 'password'>) => Promise<User>;
  register: (details: RegisterDetails) => Promise<User>;
  logout: () => Promise<void>;
  updateProgress: (progress: { currentCourseIndex?: number; courseCompletions?: boolean[] }) => Promise<User>;
}

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API functions
const fetchUser = async (): Promise<User | null> => {
  const response = await fetch('/api/user');
  if (response.ok) {
    return response.json();
  }
  return null;
};

const loginUser = async (credentials: Pick<RegisterDetails, 'email' | 'password'>): Promise<User> => {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }
  return response.json();
};

const registerUser = async (details: RegisterDetails): Promise<User> => {
  const response = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(details),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }
  return response.json();
};

const logoutUser = async (): Promise<void> => {
  await fetch('/api/logout', { method: 'POST' });
};

const updateUserProgress = async (progress: { currentCourseIndex?: number; courseCompletions?: boolean[] }): Promise<User> => {
  const response = await fetch('/api/user', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(progress),
  });
  if (!response.ok) {
    throw new Error('Failed to update progress');
  }
  return response.json();
};

// Create the AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({ 
    queryKey: ['user'], 
    queryFn: fetchUser,
    retry: false, // Don't retry on 401s
  });

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data);
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.setQueryData(['user'], null);
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: updateUserProgress,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['user'], updatedUser);
    },
  });

  const value = {
    user: user || null,
    isLoading,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    updateProgress: updateProgressMutation.mutateAsync,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Create the useAuth hook for easy consumption
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
