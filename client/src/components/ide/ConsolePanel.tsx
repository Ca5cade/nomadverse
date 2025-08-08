import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function ConsolePanel() {
  const [activeTab, setActiveTab] = useState<'console' | 'output' | 'problems'>('console');
  const [isVisible, setIsVisible] = useState(true);

  const logs = [
    { time: '12:34:56', level: 'info', message: 'Starting simulation...' },
    { time: '12:34:57', level: 'success', message: 'Robot initialized at position (0, 0, 0)' },
    { time: '12:34:58', level: 'info', message: 'Executing move_forward(10)' },
    { time: '12:34:59', level: 'info', message: 'Executing turn_right(90)' },
    { time: '12:35:00', level: 'success', message: 'Simulation running...' },
    { time: '12:35:01', level: 'warning', message: 'Warning: Robot approaching boundary' },
  ];

  const getLogColor = (level: string) => {
    switch (level) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-orange-400';
      case 'error': return 'text-red-400';
      case 'info': return 'text-accent-blue';
      default: return 'text-text-secondary';
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <footer className="h-32 bg-panel-bg border-t border-border-color flex flex-col">
      <div className="flex border-b border-border-color">
        <Button
          variant="ghost"
          className={`px-4 py-2 text-sm font-medium rounded-none border-b-2 ${
            activeTab === 'console'
              ? 'border-accent-blue text-accent-blue'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('console')}
          data-testid="tab-console"
        >
          Console
        </Button>
        <Button
          variant="ghost"
          className={`px-4 py-2 text-sm font-medium rounded-none border-b-2 ${
            activeTab === 'output'
              ? 'border-accent-blue text-accent-blue'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('output')}
          data-testid="tab-output"
        >
          Output
        </Button>
        <Button
          variant="ghost"
          className={`px-4 py-2 text-sm font-medium rounded-none border-b-2 ${
            activeTab === 'problems'
              ? 'border-accent-blue text-accent-blue'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('problems')}
          data-testid="tab-problems"
        >
          Problems
        </Button>
        <div className="flex-1"></div>
        <Button
          variant="ghost"
          size="sm"
          className="px-2 py-2 text-text-secondary hover:text-text-primary"
          onClick={() => setIsVisible(false)}
          data-testid="button-close-console"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
      
      <div className="flex-1 p-3 overflow-y-auto font-code text-xs" data-testid="console-content">
        {activeTab === 'console' && (
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div key={index} className={getLogColor(log.level)}>
                [{log.time}] {log.message}
              </div>
            ))}
          </div>
        )}
        {activeTab === 'output' && (
          <div className="text-text-secondary">
            Program output will appear here...
          </div>
        )}
        {activeTab === 'problems' && (
          <div className="text-text-secondary">
            No problems detected.
          </div>
        )}
      </div>
    </footer>
  );
}
