import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";
import type { Project } from "@shared/schema";

interface CodeEditorProps {
  project?: Project;
  fullWidth?: boolean;
}

export default function CodeEditor({ project, fullWidth = false }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [code, setCode] = useState(`# Generated from visual blocks
import robot
import time

def main():
    robot.move_forward(10)
    for i in range(5):
        robot.turn_right(90)

if __name__ == "__main__":
    main()`);

  useEffect(() => {
    if (project?.pythonCode) {
      setCode(project.pythonCode);
    }
  }, [project?.pythonCode]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
  };

  const handleExportCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'main.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`bg-editor-bg border-l border-border-color flex flex-col ${fullWidth ? 'flex-1' : 'w-96'}`}>
      <div className="bg-panel-bg px-4 py-2 border-b border-border-color flex items-center justify-between">
        <span className="text-sm font-medium text-text-primary">
          {fullWidth ? "Python Editor" : "Generated Python"}
        </span>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-text-secondary hover:text-text-primary"
            onClick={handleCopyCode}
            data-testid="button-copy-code"
          >
            <Copy className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-text-secondary hover:text-text-primary"
            onClick={handleExportCode}
            data-testid="button-export-code"
          >
            <Download className="w-3 h-3" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 relative">
        <div 
          ref={editorRef}
          className="absolute inset-0 p-4 overflow-auto font-code text-sm"
          data-testid="code-editor"
        >
          <pre className="text-text-primary leading-relaxed">
            <code>
              {code.split('\n').map((line, index) => (
                <div key={index} className="min-h-[1.25rem]">
                  {line.split(' ').map((word, wordIndex) => {
                    // Simple syntax highlighting
                    if (['import', 'def', 'for', 'if', 'in', 'range'].includes(word)) {
                      return <span key={wordIndex} className="text-purple-400">{word} </span>;
                    }
                    if (['robot', 'time', '__name__', '__main__'].includes(word)) {
                      return <span key={wordIndex} className="text-blue-400">{word} </span>;
                    }
                    if (['main'].includes(word)) {
                      return <span key={wordIndex} className="text-yellow-400">{word} </span>;
                    }
                    if (!isNaN(Number(word)) && word !== '') {
                      return <span key={wordIndex} className="text-green-400">{word} </span>;
                    }
                    if (word.startsWith('"') || word.startsWith("'")) {
                      return <span key={wordIndex} className="text-green-400">{word} </span>;
                    }
                    if (word.startsWith('#')) {
                      return <span key={wordIndex} className="text-text-secondary">{word} </span>;
                    }
                    return <span key={wordIndex} className="text-text-primary">{word} </span>;
                  })}
                </div>
              ))}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}
