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
    // Force code to appear - prioritize providedCode
    if (providedCode && providedCode.trim() !== "") {
      setCode(providedCode);
      return;
    }
    
    try {
      if (project?.blocks && project.blocks.length > 0) {
        const generatedCode = generatePythonCode(project.blocks);
        if (generatedCode && generatedCode.trim() !== "") {
          setCode(generatedCode);
          return;
        }
      }
    } catch (error) {
      console.error("Error generating code:", error);
    }
    
    // Always fall back to default code
    setCode(`# Robot Program
# Add some blocks in Visual Programming mode to generate code here

def main():
    """Main robot program"""
    # Your robot commands will appear here
    pass

if __name__ == "__main__":
    main()
`);
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
    <div className={`bg-editor-bg ${fullWidth ? 'flex-1' : 'w-96 border-l border-border-color'} flex flex-col`}>
      <div className="bg-panel-bg px-4 py-3 border-b border-border-color flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-text-primary">
            {fullWidth ? "Python Code Editor" : "Generated Python"}
          </span>
          {code && (
            <span className="text-xs text-text-secondary bg-panel-active px-2 py-1 rounded">
              {code.split('\n').length} lines
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-text-secondary hover:text-text-primary hover:bg-panel-active"
            onClick={() => setIsReadOnly(!isReadOnly)}
            data-testid="button-toggle-edit"
            title={isReadOnly ? "Enable editing" : "View only"}
          >
            {isReadOnly ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-text-secondary hover:text-text-primary hover:bg-panel-active"
            onClick={handleCopyCode}
            data-testid="button-copy-code"
            title="Copy code"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-text-secondary hover:text-text-primary hover:bg-panel-active"
            onClick={handleExportCode}
            data-testid="button-export-code"
            title="Download as Python file"
          >
            <Download className="w-4 h-4" />
          </Button>
          {fullWidth && (
            <Button
              variant="ghost"
              size="sm"
              className="text-accent-green hover:text-white hover:bg-accent-green"
              data-testid="button-run-code"
              title="Run code"
            >
              <Play className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 relative bg-gray-900 min-h-0">
        {isReadOnly ? (
          <div
            ref={editorRef}
            className="absolute inset-0 p-6 overflow-auto font-mono text-sm bg-gray-900 text-white"
            data-testid="code-editor"
            style={{ lineHeight: '1.6' }}
          >
            <pre className="text-white leading-relaxed whitespace-pre-wrap">
              {code.split('\n').map((line, index) => {
                const isCommentLine = line.trim().startsWith('#');
                const isDocstringLine = line.trim().startsWith('"""') || line.trim().startsWith("'''");
                const isEmpty = line.trim() === '';
                
                return (
                  <div key={index} className={`min-h-[1.6rem] flex ${isEmpty ? 'opacity-50' : ''}`}>
                    <span className="text-gray-500 w-12 text-right mr-4 select-none text-xs">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      {isCommentLine || isDocstringLine ? (
                        <span className="text-green-400 italic">{line}</span>
                      ) : (
                        line.split(' ').map((word, wordIndex) => {
                          // Enhanced syntax highlighting with more keywords
                          if (['import', 'from', 'def', 'class', 'for', 'if', 'in', 'range', 'while', 'elif', 'else', 'try', 'except', 'finally', 'with', 'as', 'return', 'yield', 'break', 'continue', 'pass', 'lambda', 'and', 'or', 'not', 'is', 'None', 'True', 'False'].includes(word.replace(/[(),:]/g, ''))) {
                            return <span key={wordIndex} className="text-purple-400 font-medium">{word} </span>;
                          }
                          if (['self', 'cls', '__init__', '__name__', '__main__', 'robot', 'time', 'math', 'print'].includes(word.replace(/[(),:]/g, ''))) {
                            return <span key={wordIndex} className="text-blue-400">{word} </span>;
                          }
                          if (['move_forward', 'move_backward', 'turn_left', 'turn_right', 'stop', 'set_speed', 'sleep', 'execute_program', 'main'].includes(word.replace(/[(),:]/g, ''))) {
                            return <span key={wordIndex} className="text-yellow-400">{word} </span>;
                          }
                          if (word.match(/^\d+(\.\d+)?$/)) {
                            return <span key={wordIndex} className="text-orange-400">{word} </span>;
                          }
                          if (word.startsWith('"') && word.endsWith('"') || word.startsWith("'") && word.endsWith("'")) {
                            return <span key={wordIndex} className="text-green-300">{word} </span>;
                          }
                          if (word.startsWith('"""') || word.startsWith("'''")) {
                            return <span key={wordIndex} className="text-green-400 italic">{word} </span>;
                          }
                          if (word.startsWith('#')) {
                            return <span key={wordIndex} className="text-gray-500 italic">{word} </span>;
                          }
                          if (['RobotController', 'Exception', 'KeyboardInterrupt'].includes(word.replace(/[(),:]/g, ''))) {
                            return <span key={wordIndex} className="text-cyan-400">{word} </span>;
                          }
                          return <span key={wordIndex} className="text-gray-100">{word} </span>;
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </pre>
          </div>
        ) : (
          <textarea
            className="absolute inset-0 p-6 w-full h-full bg-gray-900 text-white font-mono text-sm resize-none border-none outline-none leading-relaxed"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Edit Python code here..."
            data-testid="code-editor-textarea"
            style={{ lineHeight: '1.6' }}
          />
        )}
        {!code && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-panel-bg rounded-full flex items-center justify-center mx-auto mb-4">
                <Code className="w-8 h-8 text-text-muted" />
              </div>
              <p className="text-text-secondary mb-2">No code to display</p>
              <p className="text-xs text-text-muted">
                Create some blocks in Visual Programming mode to generate code
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}