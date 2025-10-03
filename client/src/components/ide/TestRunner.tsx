import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

interface TestCase {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  error?: string;
}

export default function TestRunner() {
  const [tests, setTests] = useState<TestCase[]>([
    {
      id: 'test-1',
      name: 'Basic Movement',
      description: 'Robot should move forward 10 steps',
      status: 'pending',
    },
    {
      id: 'test-2', 
      name: 'Rotation Test',
      description: 'Robot should turn right 90 degrees',
      status: 'pending',
    },
    {
      id: 'test-3',
      name: 'Loop Execution',
      description: 'Repeat block should execute 5 times',
      status: 'pending',
    },
    {
      id: 'test-4',
      name: 'Boundary Detection',
      description: 'Robot should detect boundaries',
      status: 'pending',
    },
  ]);

  const runAllTests = async () => {
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      
      // Set test as running
      setTests(prev => prev.map(t => 
        t.id === test.id ? { ...t, status: 'running' } : t
      ));

      // Simulate test execution
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Randomly pass or fail for demo
      const passed = Math.random() > 0.3;
      const duration = Math.floor(500 + Math.random() * 2000);
      
      setTests(prev => prev.map(t => 
        t.id === test.id 
          ? { 
              ...t, 
              status: passed ? 'passed' : 'failed',
              duration,
              error: passed ? undefined : 'Assertion failed: Expected behavior not observed'
            }
          : t
      ));
    }
  };

  const runSingleTest = async (testId: string) => {
    setTests(prev => prev.map(t => 
      t.id === testId ? { ...t, status: 'running' } : t
    ));

    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));
    
    const passed = Math.random() > 0.2;
    const duration = Math.floor(300 + Math.random() * 1000);
    
    setTests(prev => prev.map(t => 
      t.id === testId 
        ? { 
            ...t, 
            status: passed ? 'passed' : 'failed',
            duration,
            error: passed ? undefined : 'Test assertion failed'
          }
        : t
    ));
  };

  const getStatusIcon = (status: TestCase['status']) => {
    switch (status) {
      case 'running': return <Clock className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <AlertCircle className="w-4 h-4 text-text-secondary" />;
    }
  };

  const getStatusColor = (status: TestCase['status']) => {
    switch (status) {
      case 'running': return 'text-blue-400';
      case 'passed': return 'text-green-400';
      case 'failed': return 'text-red-400';
      default: return 'text-text-secondary';
    }
  };

  const passedCount = tests.filter(t => t.status === 'passed').length;
  const failedCount = tests.filter(t => t.status === 'failed').length;
  const runningCount = tests.filter(t => t.status === 'running').length;

  return (
    <div className="h-64 bg-panel-bg border-t border-border-color flex flex-col">
      <div className="border-b border-border-color p-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-sm font-semibold text-text-primary">Test Runner</h3>
          <div className="flex items-center space-x-4 text-xs">
            <span className="text-green-400">{passedCount} Passed</span>
            <span className="text-red-400">{failedCount} Failed</span>
            {runningCount > 0 && <span className="text-blue-400">{runningCount} Running</span>}
          </div>
        </div>
        <Button
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 text-white flex items-center space-x-2"
          onClick={runAllTests}
          disabled={runningCount > 0}
          data-testid="button-run-all-tests"
        >
          <Play className="w-3 h-3" />
          <span>Run All Tests</span>
        </Button>
      </div>
      
      <div className="flex-1 p-3 overflow-y-auto">
        <div className="space-y-2">
          {tests.map((test) => (
            <div 
              key={test.id}
              className="flex items-center justify-between p-2 hover:bg-border-color rounded"
              data-testid={`test-case-${test.id}`}
            >
              <div className="flex items-center space-x-3 flex-1">
                {getStatusIcon(test.status)}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-text-primary">
                      {test.name}
                    </span>
                    {test.duration && (
                      <span className="text-xs text-text-secondary">
                        {test.duration}ms
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-text-secondary mt-1">
                    {test.description}
                  </div>
                  {test.error && (
                    <div className="text-xs text-red-400 mt-1">
                      Error: {test.error}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-medium ${getStatusColor(test.status)}`}>
                  {test.status.toUpperCase()}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-text-secondary hover:text-text-primary"
                  onClick={() => runSingleTest(test.id)}
                  disabled={test.status === 'running'}
                  data-testid={`button-run-test-${test.id}`}
                >
                  <Play className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}