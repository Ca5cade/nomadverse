import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Download, Play, Eye, EyeOff } from "lucide-react";
import type { Project } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { generatePythonCode } from "@/lib/codeGenerator";

interface CodeEditorProps {
  project?: Project;
  fullWidth?: boolean;
  readOnly?: boolean;
  code?: string;
}

export default function CodeEditor({ project, readOnly = false, fullWidth = false, code: providedCode }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isReadOnly, setIsReadOnly] = useState(readOnly);
  const [code, setCode] = useState("");

  // Generate code from project blocks when project changes
  useEffect(() => {
    if (providedCode) {
      setCode(providedCode);
    } else if (project?.blocks && project.blocks.length > 0) {
      const generatedCode = generatePythonCode(project.blocks);
      setCode(generatedCode);
    } else if (project) {
      // Default code if no blocks
      setCode(`# Robot Program
# Add some blocks in Visual Programming mode to generate code here

def main():
    """Main robot program"""
    pass

if __name__ == "__main__":
    main()
`);
    }
  }, [project?.blocks, project, providedCode]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Code copied",
        description: "Python code has been copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy code to clipboard",
        variant: "destructive",
      });
    }
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

  if (!project) {
    return (
      <div className="h-full flex items-center justify-center bg-editor-bg">
        <p className="text-text-muted">No project selected</p>
      </div>
    );
  }

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
            onClick={() => setIsReadOnly(!isReadOnly)}
            data-testid="button-toggle-edit"
          >
            {isReadOnly ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          </Button>
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
          {fullWidth && (
            <Button
              variant="ghost"
              size="sm"
              className="text-green-400 hover:text-green-300"
              data-testid="button-run-code"
            >
              <Play className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 relative bg-gray-900">
        {isReadOnly ? (
          <div
            ref={editorRef}
            className="absolute inset-0 p-4 overflow-auto font-mono text-sm bg-gray-900 text-white"
            data-testid="code-editor"
          >
            <pre className="text-white leading-relaxed whitespace-pre-wrap">
              {code.split('\n').map((line, index) => (
                <div key={index} className="min-h-[1.25rem] flex">
                  <span className="text-gray-400 w-8 text-right mr-4 select-none">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    {line.split(' ').map((word, wordIndex) => {
                      // Enhanced syntax highlighting
                      if (['import', 'def', 'for', 'if', 'in', 'range', 'while', 'elif', 'else', 'try', 'except', 'finally', 'with', 'as', 'return'].includes(word)) {
                        return <span key={wordIndex} className="text-purple-400">{word} </span>;
                      }
                      if (['robot', 'time', '__name__', '__main__'].includes(word)) {
                        return <span key={wordIndex} className="text-blue-400">{word} </span>;
                      }
                      if (['main', 'move_forward', 'move_backward', 'turn_left', 'turn_right', 'sleep'].includes(word.replace(/[(),:]/g, ''))) {
                        return <span key={wordIndex} className="text-yellow-400">{word} </span>;
                      }
                      if (word.match(/^\d+$/)) {
                        return <span key={wordIndex} className="text-green-400">{word} </span>;
                      }
                      if (word.startsWith('"') || word.startsWith("'")) {
                        return <span key={wordIndex} className="text-green-300">{word} </span>;
                      }
                      if (word.startsWith('#')) {
                        return <span key={wordIndex} className="text-gray-500">{word} </span>;
                      }
                      return <span key={wordIndex} className="text-white">{word} </span>;
                    })}
                  </div>
                </div>
              ))}
            </pre>
          </div>
        ) : (
          <textarea
            className="absolute inset-0 p-4 w-full h-full bg-gray-900 text-white font-mono text-sm resize-none border-none outline-none"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Edit Python code here..."
            data-testid="code-editor-textarea"
          />
        )}
        {!code && (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">No code to display. Create some blocks to generate code.</p>
          </div>
        )}
      </div>
    </div>
  );
}