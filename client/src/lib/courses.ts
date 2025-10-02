export interface Course {
  id: number;
  title: string;
  instructions: string;
  obstacles?: { position: { x: number; y: number; z: number }; size: { x: number; y: number; z: number } }[];
}

export const courses: Course[] = [
  {
    id: 1,
    title: "Level 1: The Finish Line",
    instructions: "To complete this level, you need to move the robot forward until it crosses the red finish line.\n1. Drag a 'moveForward' block from the Block Palette into the Block Canvas.\n2. Set the 'distance' of the 'moveForward' block to a value greater than 10.\n3. Click the 'Run' button in the Simulation panel to test your program.",
  },
  {
    id: 2,
    title: "Level 2: Obstacle Course",
    instructions: "Navigate the robot through the two obstacles to reach the finish line.",
    obstacles: [
      { position: { x: 3, y: 0.5, z: 2 }, size: { x: 1, y: 1, z: 4 } },
      { position: { x: 7, y: 0.5, z: -2 }, size: { x: 1, y: 1, z: 4 } },
    ],
  },
  {
    id: 3,
    title: "Level 3: Making a Turn",
    instructions: "To complete this level, you need to make the robot turn and then move forward to the finish line.",
  },
  {
    id: 4,
    title: "Level 4: Multiple Turns",
    instructions: "To complete this level, you need to make the robot perform multiple turns to reach the finish line.",
  },
  {
    id: 5,
    title: "Level 5: The Final Challenge",
    instructions: "To complete this level, you need to use a combination of all the blocks you've learned to reach the finish line.",
  },
];