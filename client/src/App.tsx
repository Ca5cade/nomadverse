import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useIsMobile } from "./hooks/use-mobile";
import bgImage from './assets/certificate-bg1.jpg';

function App({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div 
        className="dark w-screen h-screen flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <p className="text-4xl font-bold text-white text-center shadow-2xl p-8 bg-black bg-opacity-50 rounded-lg">
          To use this website, you need a larger screen. Thank you.
          <br />
          - NomadVerse
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
