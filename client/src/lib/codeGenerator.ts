import { Block } from "@shared/schema";
import { getBlockConfig } from "./blockTypes";

export function generatePythonCode(blocks: Block[]): string {
  const imports = [
    "import robot",
    "import time",
  ];

  const mainFunctionLines: string[] = [];
  
  // Find the start block
  const startBlock = blocks.find(b => b.type === 'when_flag_clicked');
  if (startBlock) {
    generateBlockCode(startBlock, blocks, mainFunctionLines, 1);
  }

  // Generate other standalone blocks
  blocks.forEach(block => {
    if (block.type !== 'when_flag_clicked' && !isChildBlock(block, blocks)) {
      generateBlockCode(block, blocks, mainFunctionLines, 1);
    }
  });

  const code = [
    "# Generated from visual blocks",
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
    case 'move_forward':
      lines.push(`${indent}robot.move_forward(${block.inputs?.steps || 10})`);
      break;
    
    case 'move_backward':
      lines.push(`${indent}robot.move_backward(${block.inputs?.steps || 10})`);
      break;
    
    case 'turn_left':
      lines.push(`${indent}robot.turn_left(${block.inputs?.degrees || 90})`);
      break;
    
    case 'turn_right':
      lines.push(`${indent}robot.turn_right(${block.inputs?.degrees || 90})`);
      break;
    
    case 'repeat':
      lines.push(`${indent}for i in range(${block.inputs?.times || 10}):`);
      // Process child blocks
      if (block.children) {
        block.children.forEach(childId => {
          const childBlock = allBlocks.find(b => b.id === childId);
          if (childBlock) {
            generateBlockCode(childBlock, allBlocks, lines, indentLevel + 1);
          }
        });
      }
      break;
    
    case 'wait':
      lines.push(`${indent}time.sleep(${block.inputs?.seconds || 1})`);
      break;
    
    case 'if':
      const condition = block.inputs?.condition || 'True';
      lines.push(`${indent}if ${condition}:`);
      // Process child blocks
      if (block.children) {
        block.children.forEach(childId => {
          const childBlock = allBlocks.find(b => b.id === childId);
          if (childBlock) {
            generateBlockCode(childBlock, allBlocks, lines, indentLevel + 1);
          }
        });
      }
      break;
    
    case 'touching':
      lines.push(`${indent}robot.is_touching("${block.inputs?.object || 'wall'}")`);
      break;
    
    case 'distance':
      lines.push(`${indent}robot.distance_to("${block.inputs?.object || 'wall'}")`);
      break;
  }
}
