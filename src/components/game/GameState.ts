export interface GameState {
  currentLevel: number;
  stones: {
    space: boolean;
    air: boolean;
    land: boolean;
    water: boolean;
    fire: boolean;
  };
  kingHealth: number;
  gameStatus: 'playing' | 'won' | 'lost';
}

export const initialGameState: GameState = {
  currentLevel: 0,
  stones: {
    space: false,
    air: false,
    land: false,
    water: false,
    fire: false,
  },
  kingHealth: 100,
  gameStatus: 'playing',
};

export type Stone = 'space' | 'air' | 'land' | 'water' | 'fire';

export const stoneNames: Record<Stone, string> = {
  space: 'Space Stone',
  air: 'Air Stone', 
  land: 'Land Stone',
  water: 'Water Stone',
  fire: 'Fire Stone',
};

export const challengeNames = [
  'Dragon Typing Challenge',
  'Reverse Runner Challenge', 
  'Cricket Challenge',
  'Save the Queen',
  'Fire Escape Challenge',
];