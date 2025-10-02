import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import HomePage from "@/pages/home";
import LandingPage from "@/pages/landing";
import CertificatePage from "@/pages/certificate";

const ProtectedRoute = ({ component: Component, ...rest }: any) => {
  const user = localStorage.getItem("user");
  return user ? <Route {...rest} component={Component} /> : <Redirect to="/" />;
};

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <ProtectedRoute path="/home" component={HomePage} />
      <ProtectedRoute path="/certificate" component={CertificatePage} />
      <Route path="/:rest*">
        <Redirect to="/" />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <div className="dark">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;