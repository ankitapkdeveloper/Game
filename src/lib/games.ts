export interface GameInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
}

export const GAMES: GameInfo[] = [
  {
    id: 'tic-tac-toe',
    name: 'Tic Tac Toe',
    description: 'Classic X and O game. Beat the AI to score points!',
    icon: '⭕',
    color: 'from-blue-500 to-cyan-500',
    gradient: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
    difficulty: 'Easy',
    category: 'Strategy',
  },
  {
    id: 'snake',
    name: 'Snake',
    description: 'Guide the snake to eat food and grow without hitting walls!',
    icon: '🐍',
    color: 'from-green-500 to-emerald-500',
    gradient: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20',
    difficulty: 'Medium',
    category: 'Arcade',
  },
  {
    id: 'memory-match',
    name: 'Memory Match',
    description: 'Flip cards and find matching pairs before time runs out!',
    icon: '🃏',
    color: 'from-purple-500 to-pink-500',
    gradient: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20',
    difficulty: 'Easy',
    category: 'Puzzle',
  },
  {
    id: 'whack-a-mole',
    name: 'Whack-a-Mole',
    description: 'Whack as many moles as you can before time runs out!',
    icon: '🔨',
    color: 'from-amber-500 to-orange-500',
    gradient: 'bg-gradient-to-br from-amber-500/20 to-orange-500/20',
    difficulty: 'Easy',
    category: 'Action',
  },
  {
    id: 'typing-speed',
    name: 'Typing Speed',
    description: 'Test your typing speed and accuracy with random words!',
    icon: '⌨️',
    color: 'from-indigo-500 to-violet-500',
    gradient: 'bg-gradient-to-br from-indigo-500/20 to-violet-500/20',
    difficulty: 'Medium',
    category: 'Skill',
  },
  {
    id: 'math-quiz',
    name: 'Math Quiz',
    description: 'Solve math problems as fast as you can! Speed matters!',
    icon: '🧮',
    color: 'from-teal-500 to-cyan-500',
    gradient: 'bg-gradient-to-br from-teal-500/20 to-cyan-500/20',
    difficulty: 'Medium',
    category: 'Brain',
  },
  {
    id: 'color-match',
    name: 'Color Match',
    description: 'Match the color of the text, not the word itself!',
    icon: '🎨',
    color: 'from-rose-500 to-pink-500',
    gradient: 'bg-gradient-to-br from-rose-500/20 to-pink-500/20',
    difficulty: 'Hard',
    category: 'Brain',
  },
  {
    id: 'reaction-time',
    name: 'Reaction Time',
    description: 'Test your reflexes! Click as fast as you can when the screen changes!',
    icon: '⚡',
    color: 'from-yellow-500 to-amber-500',
    gradient: 'bg-gradient-to-br from-yellow-500/20 to-amber-500/20',
    difficulty: 'Easy',
    category: 'Reflex',
  },
  {
    id: 'puzzle-slider',
    name: 'Puzzle Slider',
    description: 'Slide tiles to arrange numbers in order. Fewer moves = higher score!',
    icon: '🧩',
    color: 'from-sky-500 to-blue-500',
    gradient: 'bg-gradient-to-br from-sky-500/20 to-blue-500/20',
    difficulty: 'Hard',
    category: 'Puzzle',
  },
  {
    id: 'minesweeper',
    name: 'Minesweeper',
    description: 'Clear the board without hitting a mine. Classic strategy game!',
    icon: '💣',
    color: 'from-gray-500 to-slate-500',
    gradient: 'bg-gradient-to-br from-gray-500/20 to-slate-500/20',
    difficulty: 'Hard',
    category: 'Strategy',
  },
];

export function getGameById(id: string): GameInfo | undefined {
  return GAMES.find((g) => g.id === id);
}
