import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useIsMobile } from "./hooks/use-mobile";

function App({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="dark w-screen h-screen flex items-center justify-center">
        <p className="text-center">
          to use this website you need a large screen thank you -NomadVerse
        </p>
      </div>
    );
  }
  return (
    <div className="dark">
      <TooltipProvider>
        <Toaster />
        {children}
      </TooltipProvider>
    </div>
  );
}

export default App;
