import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

function App({ children }: { children: React.ReactNode }) {
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
