import { Block } from "@shared/schema";

export interface BlockInput {
  name: string;
  label: string;
  type: 'number' | 'text' | 'boolean';
  defaultValue?: any;
}

export interface BlockType {
  type: string;
  label: string;
  category: Block['category'];
  inputs?: BlockInput[];
  outputs?: string[];
}

export const blockTypes = {
  motion: [
    { type: 'moveForward', label: 'Move Forward', inputs: [{ name: 'steps', label: 'steps', type: 'number', defaultValue: 10 }] },
    { type: 'moveBackward', label: 'Move Backward', inputs: [{ name: 'steps', label: 'steps', type: 'number', defaultValue: 10 }] },
    { type: 'turnLeft', label: 'Turn Left', inputs: [{ name: 'degrees', label: 'degrees', type: 'number', defaultValue: 90 }] },
    { type: 'turnRight', label: 'Turn Right', inputs: [{ name: 'degrees', label: 'degrees', type: 'number', defaultValue: 90 }] },
  ],
  control: [
    { type: 'repeat', label: 'Repeat:', inputs: [{ name: 'times', label: 'times', type: 'number', defaultValue: 10 }] },
    { type: 'if', label: 'If', inputs: [{ name: 'condition', label: 'condition', type: 'text', defaultValue: 'True' }] },
  ],
  sensing: [
    { type: 'isPathAhead', label: 'Is Path Ahead?' },
    { type: 'isPathLeft', label: 'Is Path Left?' },
    { type: 'isPathRight', label: 'Is Path Right?' },
  ],
  events: [
    { type: 'onStart', label: 'On Start' },
  ],
};

export const getAllBlockTypes = (): BlockType[] => {
  return [
    ...blockTypes.events,
    ...blockTypes.motion,
    ...blockTypes.control,
    ...blockTypes.sensing,
  ];
};

export const getBlockConfig = (blockType: string): BlockType | undefined => {
  return getAllBlockTypes().find(b => b.type === blockType);
};
