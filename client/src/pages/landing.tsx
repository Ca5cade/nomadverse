import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const { user, login, register } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      setLocation("/home");
    }
  }, [user, setLocation]);

  const handleAuthAction = async () => {
    setError(""); // Clear previous errors
    try {
      if (isLogin) {
        await login({ email, password });
      } else {
        // The register function in our hook expects an email and password
        await register({ email, password });
      }
      setLocation("/home");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAuthAction();
  };

  return (
    <div className="dark bg-background text-foreground min-h-screen flex flex-col items-center justify-center">
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h1 className="text-5xl font-bold mb-4">Welcome to NomadVerse</h1>
        <p className="text-xl text-muted-foreground mb-8">
          A universe of creative coding and robotics, designed to bring your ideas to life. 
          Whether you are a beginner or a pro, NomadVerse provides the tools to build, learn, and innovate.
        </p>
      </div>
      <Card className="w-full max-w-sm bg-panel-bg border-border-color">
        <CardHeader>
          <CardTitle className="text-center text-2xl">{isLogin ? "Login" : "Sign Up"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input 
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full">{isLogin ? "Login" : "Sign Up"}</Button>
          </form>
          <Button variant="link" onClick={() => { setIsLogin(!isLogin); setError(""); }} className="w-full mt-4">
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
