import { createRoot } from "react-dom/client";
import App from "@/App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Switch, Route, Redirect } from "wouter";
import HomePage from "@/pages/home";
import LandingPage from "@/pages/landing";
import CertificatePage from "@/pages/certificate";



const ProtectedRoute = ({ component: Component, ...rest }: any) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="h-screen bg-editor-bg flex items-center justify-center text-text-primary">Loading...</div>;
  }

  return user ? <Route {...rest} component={Component} /> : <Redirect to="/" />;
};

function AppRouter() {
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

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <App>
        <AppRouter />
      </App>
    </AuthProvider>
  </QueryClientProvider>
);