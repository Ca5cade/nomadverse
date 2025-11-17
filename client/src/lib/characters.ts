export interface Character {
  name: string;
  modelPath: string;
  unlockLevel: number; // Level that needs to be completed to unlock this character
}

export const CHARACTERS: Character[] = [
  {
    name: 'Fennec',
    modelPath: '/src/assets/models/Fennec.glb',
    unlockLevel: 0, // Unlocked by default
  },
  {
    name: 'Fish',
    modelPath: '/src/assets/models/Fish.glb',
    unlockLevel: 1,
  },
  {
    name: 'Mini Groot',
    modelPath: '/src/assets/models/MiniGroot.glb',
    unlockLevel: 2,
  },
  {
    name: 'Lava Golem',
    modelPath: '/src/assets/models/LavaGolem.glb',
    unlockLevel: 3,
  },
  {
    name: 'Astronaut',
    modelPath: '/src/assets/models/Astronaut.glb',
    unlockLevel: 4,
  },
];

export const getCharacterByName = (name: string) => {
  return CHARACTERS.find(c => c.name === name);
};
