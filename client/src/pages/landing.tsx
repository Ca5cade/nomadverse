import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find((u: any) => u.username === username && u.password === password);
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.removeItem("programmingMode");
      setLocation("/home");
    } else {
      setError("Invalid username or password");
    }
  };

  const handleSignUp = () => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const userExists = users.some((u: any) => u.username === username);
    if (userExists) {
      setError("Username already exists");
    } else {
      const newUser = { username, password };
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("user", JSON.stringify(newUser));
      localStorage.removeItem("programmingMode");
      setLocation("/home");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      handleLogin();
    } else {
      handleSignUp();
    }
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
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input 
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full">{isLogin ? "Login" : "Sign Up"}</Button>
          </form>
          <Button variant="link" onClick={() => setIsLogin(!isLogin)} className="w-full mt-4">
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}