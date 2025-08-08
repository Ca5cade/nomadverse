import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Trash2, Download, Terminal, Info, AlertTriangle, CheckCircle, XCircle, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  source?: string;
}

export default function ConsolePanel() {
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: new Date(),
      level: 'success',
      message: 'RobotIDE Professional Edition initialized successfully',
      source: 'System'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 1000),
      level: 'info',
      message: 'Ready for visual programming and simulation',
      source: 'IDE'
    }
  ]);
  const [filter, setFilter] = useState<'all' | 'info' | 'warning' | 'error' | 'success'>('all');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const clearLogs = () => {
    setLogs([]);
    toast({
      title: "Console cleared",
      description: "All log entries have been removed",
    });
  };

  const copyLogs = () => {
    const logText = filteredLogs.map(log => 
      `[${log.timestamp.toISOString()}] ${log.level.toUpperCase()}: ${log.message}`
    ).join('\n');
    navigator.clipboard.writeText(logText);
    toast({
      title: "Logs copied",
      description: "Console logs copied to clipboard",
    });
  };

  const exportLogs = () => {
    const logText = filteredLogs.map(log => 
      `[${log.timestamp.toISOString()}] ${log.level.toUpperCase()}: ${log.message} ${log.source ? `(${log.source})` : ''}`
    ).join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `robotide-logs-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Logs exported",
      description: "Console logs saved to file",
    });
  };

  const filteredLogs = logs.filter(log => filter === 'all' || log.level === filter);

  const levelConfig = {
    info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    warning: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    error: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    success: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' }
  };

  const filterOptions = [
    { value: 'all' as const, label: 'All', count: logs.length },
    { value: 'info' as const, label: 'Info', count: logs.filter(l => l.level === 'info').length },
    { value: 'warning' as const, label: 'Warnings', count: logs.filter(l => l.level === 'warning').length },
    { value: 'error' as const, label: 'Errors', count: logs.filter(l => l.level === 'error').length },
    { value: 'success' as const, label: 'Success', count: logs.filter(l => l.level === 'success').length }
  ];

  return (
    <div className="h-full bg-gradient-to-b from-panel-bg to-panel-hover border-t border-border-color shadow-premium flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border-color bg-gradient-to-r from-panel-hover to-panel-active">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-primary flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-accent-green to-accent-blue shadow-sm">
              <Terminal className="w-3.5 h-3.5 text-white" />
            </div>
            <span>Console</span>
            <span className="text-xs text-text-muted bg-panel-bg px-2 py-0.5 rounded-full">
              {filteredLogs.length}
            </span>
          </h3>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyLogs}
              className="h-7 w-7 p-0 hover:bg-accent-blue/10 hover:text-accent-blue transition-all hover:scale-110"
              title="Copy Logs"
            >
              <Copy className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={exportLogs}
              className="h-7 w-7 p-0 hover:bg-accent-purple/10 hover:text-accent-purple transition-all hover:scale-110"
              title="Export Logs"
            >
              <Download className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearLogs}
              className="h-7 w-7 p-0 hover:bg-red-500/10 hover:text-red-400 transition-all hover:scale-110"
              title="Clear Console"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1 bg-panel-bg rounded-lg p-1">
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              variant="ghost"
              size="sm"
              className={`h-7 px-3 text-xs transition-all ${
                filter === option.value
                  ? 'bg-accent-blue text-white shadow-sm'
                  : 'hover:bg-panel-hover text-text-secondary hover:text-text-primary'
              }`}
              onClick={() => setFilter(option.value)}
            >
              {option.label}
              {option.count > 0 && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  filter === option.value 
                    ? 'bg-white/20' 
                    : 'bg-text-muted/20'
                }`}>
                  {option.count}
                </span>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Console Output */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-sm"
      >
        {filteredLogs.map((log) => {
          const config = levelConfig[log.level];
          const IconComponent = config.icon;
          
          return (
            <div
              key={log.id}
              className={`flex items-start space-x-3 p-3 rounded-lg border ${config.bg} ${config.border} transition-all hover:scale-[1.01] hover:shadow-sm`}
            >
              <IconComponent className={`w-4 h-4 ${config.color} flex-shrink-0 mt-0.5`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs text-text-muted">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                  {log.source && (
                    <span className="text-xs text-text-muted bg-panel-bg px-2 py-0.5 rounded">
                      {log.source}
                    </span>
                  )}
                </div>
                <p className="text-text-primary leading-relaxed break-words">{log.message}</p>
              </div>
            </div>
          );
        })}

        {filteredLogs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Filter className="w-12 h-12 text-text-muted mb-4" />
            <p className="text-text-muted mb-2">No logs found</p>
            <p className="text-sm text-text-muted">
              {filter === 'all' ? 'Console is empty' : `No ${filter} messages to display`}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border-color bg-panel-bg flex items-center justify-between">
        <p className="text-xs text-text-muted">
          Professional Console v2.0
        </p>
        <div className="flex items-center space-x-2 text-xs text-text-muted">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Ready</span>
        </div>
      </div>
    </div>
  );
}