import FennecModel from '@/assets/models/Fennec.glb';
import FishModel from '@/assets/models/Fish.glb';
import MiniGrootModel from '@/assets/models/MiniGroot.glb';
import LavaGolemModel from '@/assets/models/LavaGolem.glb';
import AstronautModel from '@/assets/models/Astronaut.glb';

export interface Character {
  name: string;
  modelPath: string;
  unlockLevel: number; // Level that needs to be completed to unlock this character
}

export const CHARACTERS: Character[] = [
  {
    name: 'Fennec',
    modelPath: FennecModel,
    unlockLevel: 0, // Unlocked by default
  },
  {
    name: 'Fish',
    modelPath: FishModel,
    unlockLevel: 1,
  },
  {
    name: 'Mini Groot',
    modelPath: MiniGrootModel,
    unlockLevel: 2,
  },
  {
    name: 'Lava Golem',
    modelPath: LavaGolemModel,
    unlockLevel: 3,
  },
  {
    name: 'Astronaut',
    modelPath: AstronautModel,
    unlockLevel: 4,
  },
];

export const getCharacterByName = (name: string) => {
  return CHARACTERS.find(c => c.name === name);
};
