import { Block } from "@shared/schema";
import { getBlockConfig } from "./blockTypes";

export function generatePythonCode(blocks: Block[]): string {
  const imports = [
    "import robot",
    "import time",
  ];

  const mainFunctionLines: string[] = [];
  
  if (blocks.length === 0) {
    mainFunctionLines.push("    # No blocks to execute");
    mainFunctionLines.push("    pass");
  } else {
    // Find the start block
    const startBlock = blocks.find(b => b.type === 'when_flag_clicked');
    if (startBlock) {
      mainFunctionLines.push("    # Start of program");
      generateBlockCode(startBlock, blocks, mainFunctionLines, 1);
    }

    // Generate other standalone blocks
    const standaloneBlocks = blocks.filter(block => 
      block.type !== 'when_flag_clicked' && !isChildBlock(block, blocks)
    );
    
    if (standaloneBlocks.length > 0) {
      if (startBlock) mainFunctionLines.push("");
      mainFunctionLines.push("    # Standalone blocks");
      standaloneBlocks.forEach(block => {
        generateBlockCode(block, blocks, mainFunctionLines, 1);
      });
    }
  }

  const code = [
    "# Generated from visual blocks",
    "# This code controls a robot using the robot module",
    "",
    ...imports,
    "",
    "def main():",
    ...mainFunctionLines,
    "",
    'if __name__ == "__main__":',
    "    main()",
  ];

  return code.join('\n');
}

function isChildBlock(block: Block, allBlocks: Block[]): boolean {
  return allBlocks.some(b => b.children?.includes(block.id));
}

function generateBlockCode(block: Block, allBlocks: Block[], lines: string[], indentLevel: number): void {
  const indent = "    ".repeat(indentLevel);
  const config = getBlockConfig(block.type);

  if (!config) return;

  switch (block.type) {
    case 'when_flag_clicked':
      lines.push(`${indent}# Program starts here`);
      // Process any connected blocks after this
      if (block.children) {
        block.children.forEach(childId => {
          const childBlock = allBlocks.find(b => b.id === childId);
          if (childBlock) {
            generateBlockCode(childBlock, allBlocks, lines, indentLevel);
          }
        });
      }
      break;
      
    case 'move_forward':
      const forwardSteps = block.inputs?.steps || 10;
      lines.push(`${indent}robot.move_forward(${forwardSteps})  # Move forward ${forwardSteps} steps`);
      break;
    
    case 'move_backward':
      const backwardSteps = block.inputs?.steps || 10;
      lines.push(`${indent}robot.move_backward(${backwardSteps})  # Move backward ${backwardSteps} steps`);
      break;
    
    case 'turn_left':
      const leftDegrees = block.inputs?.degrees || 90;
      lines.push(`${indent}robot.turn_left(${leftDegrees})  # Turn left ${leftDegrees} degrees`);
      break;
    
    case 'turn_right':
      const rightDegrees = block.inputs?.degrees || 90;
      lines.push(`${indent}robot.turn_right(${rightDegrees})  # Turn right ${rightDegrees} degrees`);
      break;
    
    case 'repeat':
      const times = block.inputs?.times || 10;
      lines.push(`${indent}for i in range(${times}):  # Repeat ${times} times`);
      if (block.children && block.children.length > 0) {
        block.children.forEach(childId => {
          const childBlock = allBlocks.find(b => b.id === childId);
          if (childBlock) {
            generateBlockCode(childBlock, allBlocks, lines, indentLevel + 1);
          }
        });
      } else {
        lines.push(`${indent}    pass  # No blocks inside repeat`);
      }
      break;
    
    case 'wait':
      const seconds = block.inputs?.seconds || 1;
      lines.push(`${indent}time.sleep(${seconds})  # Wait ${seconds} second(s)`);
      break;
    
    case 'if':
      const condition = block.inputs?.condition || 'True';
      lines.push(`${indent}if ${condition}:`);
      if (block.children && block.children.length > 0) {
        block.children.forEach(childId => {
          const childBlock = allBlocks.find(b => b.id === childId);
          if (childBlock) {
            generateBlockCode(childBlock, allBlocks, lines, indentLevel + 1);
          }
        });
      } else {
        lines.push(`${indent}    pass  # No blocks inside if`);
      }
      break;
    
    case 'touching':
      const touchObject = block.inputs?.object || 'wall';
      lines.push(`${indent}robot.is_touching("${touchObject}")  # Check if touching ${touchObject}`);
      break;
    
    case 'distance':
      const distanceObject = block.inputs?.object || 'wall';
      lines.push(`${indent}robot.distance_to("${distanceObject}")  # Get distance to ${distanceObject}`);
      break;
  }
}
