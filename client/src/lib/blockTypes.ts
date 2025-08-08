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
  events: [
    {
      type: 'when_flag_clicked',
      label: 'when flag clicked',
      category: 'events' as const,
    },
  ],
  motion: [
    {
      type: 'move_forward',
      label: 'move forward',
      category: 'motion' as const,
      inputs: [
        { name: 'steps', label: 'steps', type: 'number' as const, defaultValue: 10 }
      ],
    },
    {
      type: 'move_backward',
      label: 'move backward',
      category: 'motion' as const,
      inputs: [
        { name: 'steps', label: 'steps', type: 'number' as const, defaultValue: 10 }
      ],
    },
    {
      type: 'turn_left',
      label: 'turn left',
      category: 'motion' as const,
      inputs: [
        { name: 'degrees', label: 'degrees', type: 'number' as const, defaultValue: 90 }
      ],
    },
    {
      type: 'turn_right',
      label: 'turn right',
      category: 'motion' as const,
      inputs: [
        { name: 'degrees', label: 'degrees', type: 'number' as const, defaultValue: 90 }
      ],
    },
  ],
  control: [
    {
      type: 'repeat',
      label: 'repeat',
      category: 'control' as const,
      inputs: [
        { name: 'times', label: 'times', type: 'number' as const, defaultValue: 10 }
      ],
    },
    {
      type: 'if',
      label: 'if',
      category: 'control' as const,
      inputs: [
        { name: 'condition', label: '', type: 'boolean' as const }
      ],
    },
    {
      type: 'wait',
      label: 'wait',
      category: 'control' as const,
      inputs: [
        { name: 'seconds', label: 'seconds', type: 'number' as const, defaultValue: 1 }
      ],
    },
  ],
  sensing: [
    {
      type: 'touching',
      label: 'touching',
      category: 'sensing' as const,
      inputs: [
        { name: 'object', label: 'object', type: 'text' as const, defaultValue: 'wall' }
      ],
    },
    {
      type: 'distance',
      label: 'distance to',
      category: 'sensing' as const,
      inputs: [
        { name: 'object', label: 'object', type: 'text' as const, defaultValue: 'wall' }
      ],
    },
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
