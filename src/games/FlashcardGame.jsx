import { useState, useCallback, useRef, useEffect } from 'react';
import { WORDS } from '../data/words';
import { CELEBRATIONS, GUIDES } from '../data/celebrations';
import { shuffle, pick } from '../utils/random';
import Header from '../components/Header';
import FlipCard from '../components/FlipCard';
import CelebrationOverlay from '../components/CelebrationOverlay';
import EndScreen from '../components/EndScreen';

const CELEBRATE_EVERY = 5;

export default function FlashcardGame({ onHome, onStar, totalStars }) {
  const [queue, setQueue] = useState(() => shuffle(WORDS));
  const [wordIdx, setWordIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [phase, setPhase] = useState('play'); // 'play' | 'celebration' | 'end'
  const [sessionStars, setSessionStars] = useState(0);
  const [celebration, setCelebration] = useState(null);
  const [guideIdx] = useState(() => Math.floor(Math.random() * GUIDES.length));
  const celebTimerRef = useRef(null);

  const card = queue[wordIdx];

  const advance = useCallback(() => {
    setCelebration(null);
    setFlipped(false);
    setWordIdx((i) => {
      if (i + 1 >= queue.length) {
        setPhase('end');
        return i;
      }
      setPhase('play');
      return i + 1;
    });
  }, [queue.length]);

  const handleGotIt = useCallback(() => {
    if (phase !== 'play') return;
    setSessionStars((s) => s + 1);
    onStar();
    const finished = wordIdx + 1;
    if (finished % CELEBRATE_EVERY === 0 || finished >= queue.length) {
      setCelebration(pick(CELEBRATIONS));
      setPhase('celebration');
      celebTimerRef.current = setTimeout(advance, 2400);
    } else {
      advance();
    }
  }, [phase, wordIdx, queue.length, onStar, advance]);

  const handleHelp = useCallback(() => {
    if (phase === 'play') setFlipped(true);
  }, [phase]);

  const handleFlip = useCallback(() => {
    if (phase === 'play') setFlipped((f) => !f);
  }, [phase]);

  const handlePlayAgain = useCallback(() => {
    setQueue(shuffle(WORDS));
    setWordIdx(0);
    setFlipped(false);
    setPhase('play');
    setSessionStars(0);
    setCelebration(null);
  }, []);

  useEffect(() => () => clearTimeout(celebTimerRef.current), []);

  if (phase === 'end') {
    return (
      <EndScreen
        stars={sessionStars}
        onPlayAgain={handlePlayAgain}
        onHome={onHome}
        emoji="🦄"
        subtitle="You read all the words!"
      />
    );
  }

  return (
    <div>
      <CelebrationOverlay celebration={celebration} stars={sessionStars} />

      <div className="game-container">
        <Header
          stars={totalStars}
          progressText={`Word ${wordIdx + 1} of ${queue.length}`}
          title="🦄 Words"
          onHome={onHome}
        />

        <div className="card-area">
          <div className="guide">{GUIDES[guideIdx]}</div>

          <FlipCard
            word={card.word}
            hint={{ emoji: card.emoji, sound: card.sound }}
            flipped={flipped}
            onFlip={handleFlip}
          />
        </div>

        <div className="buttons">
          <button className="btn btn-no" onClick={handleHelp}>
            <span className="btn-icon">🔄</span>
            <span>Help me</span>
          </button>
          <button className="btn btn-yes" onClick={handleGotIt}>
            <span className="btn-icon">✨</span>
            <span>I read it!</span>
          </button>
        </div>
      </div>
    </div>
  );
}
