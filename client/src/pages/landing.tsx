import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="dark bg-background text-foreground min-h-screen flex flex-col items-center justify-center">
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h1 className="text-5xl font-bold mb-4">Welcome to NomadVerse</h1>
        <p className="text-xl text-muted-foreground mb-8">
          A universe of creative coding and robotics, designed to bring your ideas to life. 
          Whether you are a beginner or a pro, NomadVerse provides the tools to build, learn, and innovate.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/login">
            <Button size="lg">Login</Button>
          </Link>
          <Link to="/register">
            <Button size="lg" variant="outline">Register</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
