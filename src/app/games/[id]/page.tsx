'use client';

import { useParams } from 'next/navigation';
import type { ComponentType } from 'react';
import GameWrapper from '@/components/GameWrapper';
import TicTacToe from '@/components/games/TicTacToe';
import Snake from '@/components/games/Snake';
import MemoryMatch from '@/components/games/MemoryMatch';
import WhackAMole from '@/components/games/WhackAMole';
import TypingSpeed from '@/components/games/TypingSpeed';
import MathQuiz from '@/components/games/MathQuiz';
import ColorMatch from '@/components/games/ColorMatch';
import ReactionTime from '@/components/games/ReactionTime';
import PuzzleSlider from '@/components/games/PuzzleSlider';
import Minesweeper from '@/components/games/Minesweeper';

const gameComponents: Record<string, ComponentType<any>> = {
  'tic-tac-toe': TicTacToe,
  snake: Snake,
  'memory-match': MemoryMatch,
  'whack-a-mole': WhackAMole,
  'typing-speed': TypingSpeed,
  'math-quiz': MathQuiz,
  'color-match': ColorMatch,
  'reaction-time': ReactionTime,
  'puzzle-slider': PuzzleSlider,
  minesweeper: Minesweeper,
};

export default function GamePage() {
  const params = useParams();
  const gameId = params.id as string;
  const GameComponent = gameComponents[gameId];

  return (
    <GameWrapper gameId={gameId}>
      {({ onGameOver, isPlaying, startGame }) =>
        GameComponent ? (
          <GameComponent
            onGameOver={onGameOver}
            isPlaying={isPlaying}
            startGame={startGame}
          />
        ) : (
          <div className="text-center py-12">
            <p>Game not found</p>
          </div>
        )
      }
    </GameWrapper>
  );
}
