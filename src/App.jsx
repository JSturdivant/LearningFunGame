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

// A big "treat" reward appears every TREAT_EVERY stars — roughly every
// 2-5 minutes of play depending on the game.
const TREAT_EVERY = 5;

const GAMES = {
  flashcards: FlashcardGame,
  sentences: SentenceGame,
  counting: CountingGame,
  math: MathGame,
};

export default function App() {
  const [mode, setMode] = useState('menu');
  const [totalStars, setTotalStars] = useState(0);
  const [treat, setTreat] = useState(null);
  const sinceTreatRef = useRef(0);

  const awardStar = useCallback(() => {
    setTotalStars((s) => s + 1);
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
