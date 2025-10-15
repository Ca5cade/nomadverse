import React, { useState } from 'react';
import Spline from '@splinetool/react-spline';
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';

// LoginForm component
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login({ email, password });
      setLocation('/home');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-cyan-400">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-gray-800 text-white border-gray-600"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-cyan-400">Password</Label>
        <Input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-gray-800 text-white border-gray-600"
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
}

// RegisterForm component
function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setIsLoading(false);
      return;
    }
    try {
      await register({ email, password });
      setLocation('/home');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-cyan-400">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-gray-800 text-white border-gray-600"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-cyan-400">Password</Label>
        <Input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-gray-800 text-white border-gray-600"
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating Account...' : 'Register'}
      </Button>
    </form>
  );
}


export default function LandingPage() {

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <div className="absolute inset-0 z-10 flex flex-col justify-between items-center text-center text-white bg-black bg-opacity-30 p-8 pointer-events-none">
        <h1 className="text-5xl font-bold pointer-events-auto">Welcome to NomadVerse</h1>
        
        <div className="flex flex-col items-center pointer-events-auto">
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
            A universe of creative coding and robotics, designed to bring your ideas to life.
            Whether you are a beginner or a pro, NomadVerse provides the tools to build, learn, and innovate.
          </p>
          <div className="flex gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button>Login</Button>
              </DialogTrigger>
              <DialogContent className="bg-black text-cyan-400 border-cyan-400">
                <DialogHeader>
                  <DialogTitle>Login</DialogTitle>
                </DialogHeader>
                <LoginForm />
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Sign Up</Button>
              </DialogTrigger>
              <DialogContent className="bg-black text-cyan-400 border-cyan-400">
                <DialogHeader>
                  <DialogTitle>Sign Up</DialogTitle>
                </DialogHeader>
                <RegisterForm />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 scale-125">
        <Spline
          scene="https://prod.spline.design/lq08VVV7836-3FKp/scene.splinecode"
        />
      </div>
    </main>
  );
}
