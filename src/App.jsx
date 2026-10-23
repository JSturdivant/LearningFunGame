import { useState, useCallback, useRef } from 'react';
import { TREATS } from './data/rewards';
import { pick } from './utils/random';
import StarBackground from './components/StarBackground';
import WelcomeScreen from './components/WelcomeScreen';
import RewardOverlay from './components/RewardOverlay';
import FlashcardGame from './games/FlashcardGame';
import SentenceGame from './games/SentenceGame';
import CountingGame from './games/CountingGame';
import MathGame from './games/MathGame';
import CrosswordGame from './games/CrosswordGame';

// A big "treat" reward appears every TREAT_EVERY stars — roughly every
// 2-5 minutes of play depending on the game.
const TREAT_EVERY = 5;

const GAMES = {
  flashcards: FlashcardGame,
  sentences: SentenceGame,
  counting: CountingGame,
  math: MathGame,
  crossword: CrosswordGame,
};

export default function App() {
  const [mode, setMode] = useState('menu');
  const [totalStars, setTotalStars] = useState(0);
  const [treat, setTreat] = useState(null);
  const sinceTreatRef = useRef(0);

  // Games with their own big finish (like the crossword's puzzle party) can
  // pass { treat: false } so a treat doesn't pop up on top of it.
  const awardStar = useCallback(({ treat = true } = {}) => {
    setTotalStars((s) => s + 1);
    if (!treat) return;
    sinceTreatRef.current += 1;
    if (sinceTreatRef.current >= TREAT_EVERY) {
      sinceTreatRef.current = 0;
      setTreat(pick(TREATS));
    }
  }, []);

  const goHome = useCallback(() => setMode('menu'), []);
  const closeTreat = useCallback(() => setTreat(null), []);

  const Game = GAMES[mode];

  return (
    <div>
      <StarBackground />
      <RewardOverlay treat={treat} onClose={closeTreat} />
      {Game ? (
        <Game onHome={goHome} onStar={awardStar} totalStars={totalStars} />
      ) : (
        <WelcomeScreen totalStars={totalStars} onPick={setMode} />
      )}
    </div>
  );
}
