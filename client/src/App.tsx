import { Switch, Route, Redirect } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import HomePage from "@/pages/home";
import LandingPage from "@/pages/landing"; // This can be reused or replaced
import CertificatePage from "@/pages/certificate";
import LoginPage from "@/pages/Login";
import RegisterPage from "@/pages/Register";
import { useAuth } from "./hooks/use-auth";

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="dark">
      <TooltipProvider>
        <Toaster />
        <Switch>
          {user ? (
            <>
              <Route path="/" component={HomePage} />
              <Route path="/home" component={HomePage} />
              <Route path="/certificate" component={CertificatePage} />
              {/* Redirect authenticated users away from login/register */}
              <Route path="/login">
                <Redirect to="/" />
              </Route>
              <Route path="/register">
                <Redirect to="/" />
              </Route>
            </>
          ) : (
            <>
              <Route path="/login" component={LoginPage} />
              <Route path="/register" component={RegisterPage} />
              {/* Redirect unauthenticated users to login */}
              <Route path="/:rest*">
                <Redirect to="/login" />
              </Route>
            </>
          )}
        </Switch>
      </TooltipProvider>
    </div>
  );
}

export default App;