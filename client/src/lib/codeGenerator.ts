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
    // Find all block IDs that are children of some other block
    const childBlockIds = new Set<string>();
    blocks.forEach(block => {
      if (block.children) {
        block.children.forEach(childId => childBlockIds.add(childId));
      }
    });

    // Identify top-level blocks (those not found in any children list)
    let topLevelBlocks = blocks.filter(block => !childBlockIds.has(block.id));

    // Ensure 'onStart' block is always the first top-level block if it exists
    const onStartBlock = topLevelBlocks.find(block => block.type === 'onStart');
    if (onStartBlock) {
      topLevelBlocks = topLevelBlocks.filter(block => block.id !== onStartBlock.id);
      topLevelBlocks.unshift(onStartBlock); // Place onStart at the beginning
    }

    // Sort top-level blocks by their y-coordinate, then by x-coordinate
    topLevelBlocks.sort((a, b) => {
      if (a.y !== b.y) {
        return a.y - b.y;
      }
      return a.x - b.x;
    });

    if (topLevelBlocks.length > 0) {
      mainFunctionLines.push("    # Program starts here");
      topLevelBlocks.forEach(block => {
        generateBlockCode(block, blocks, mainFunctionLines, 1);
      });
    } else {
      mainFunctionLines.push("    # No blocks to execute");
      mainFunctionLines.push("    pass");
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

// Helper to collect all connected block IDs starting from a given block
function collectConnectedBlockIds(block: Block, allBlocks: Block[], collectedIds: Set<string>): void {
  collectedIds.add(block.id);
  if (block.children) {
    block.children.forEach(childId => {
      const childBlock = allBlocks.find(b => b.id === childId);
      if (childBlock && !collectedIds.has(childBlock.id)) {
        collectConnectedBlockIds(childBlock, allBlocks, collectedIds);
      }
    });
  }
}

function generateBlockCode(block: Block, allBlocks: Block[], lines: string[], indentLevel: number): void {
  const indent = "    ".repeat(indentLevel);
  const config = getBlockConfig(block.type);

  if (!config) return;

  // 1. Generate code for the current block
  switch (block.type) {
    case 'onStart':
      break; // No code for the block itself
    case 'moveForward':
      const forwardSteps = block.inputs?.steps || 10;
      lines.push(`${indent}robot.moveForward(${forwardSteps})  # Move forward ${forwardSteps} steps`);
      break;
    case 'moveBackward':
      const backwardSteps = block.inputs?.steps || 10;
      lines.push(`${indent}robot.moveBackward(${backwardSteps})  # Move backward ${backwardSteps} steps`);
      break;
    case 'turnLeft':
      const leftDegrees = block.inputs?.degrees || 90;
      lines.push(`${indent}robot.turnLeft(${leftDegrees})  # Turn left ${leftDegrees} degrees`);
      break;
    case 'turnRight':
      const rightDegrees = block.inputs?.degrees || 90;
      lines.push(`${indent}robot.turnRight(${rightDegrees})  # Turn right ${rightDegrees} degrees`);
      break;
    case 'repeat':
      const times = block.inputs?.times || 10;
      lines.push(`${indent}for i in range(${times}):  # Repeat ${times} times`);
      break;
    case 'wait':
      const seconds = block.inputs?.seconds || 1;
      lines.push(`${indent}time.sleep(${seconds})  # Wait ${seconds} second(s)`);
      break;
    case 'if':
      const condition = block.inputs?.condition || 'True';
      lines.push(`${indent}if ${condition}:`);
      break;
    case 'isPathAhead':
      lines.push(`${indent}robot.isPathAhead()  # Check if path ahead`);
      break;
    case 'isPathLeft':
      lines.push(`${indent}robot.isPathLeft()  # Check if path left`);
      break;
    case 'isPathRight':
      lines.push(`${indent}robot.isPathRight()  # Check if path right`);
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

  // 2. Recursively generate code for children
  const children = (block.children || [])
    .map(childId => allBlocks.find(b => b.id === childId))
    .filter((b): b is Block => !!b)
    .sort((a, b) => a.y - b.y);

  if (children.length > 0) {
    children.forEach(child => {
      let childIndentLevel = indentLevel;
      if ((block.type === 'repeat' || block.type === 'if') && child.x > block.x) {
        childIndentLevel++;
      }
      generateBlockCode(child, allBlocks, lines, childIndentLevel);
    });
  } else if (block.type === 'repeat' || block.type === 'if') {
    lines.push(`${indent}    pass  # No blocks inside`);
  }
}

