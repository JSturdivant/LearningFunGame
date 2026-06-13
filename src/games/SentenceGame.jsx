import { useState, useCallback, useRef, useEffect } from 'react';
import { SENTENCES } from '../data/sentences';
import { CELEBRATIONS, GUIDES } from '../data/celebrations';
import { shuffle, pick } from '../utils/random';
import Header from '../components/Header';
import SentencePhase from '../components/SentencePhase';
import CelebrationOverlay from '../components/CelebrationOverlay';
import EndScreen from '../components/EndScreen';

const CELEBRATE_EVERY = 5;

export default function SentenceGame({ onHome, onStar, totalStars }) {
  const [queue, setQueue] = useState(() => shuffle(SENTENCES));
  const [idx, setIdx] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [phase, setPhase] = useState('play'); // 'play' | 'celebration' | 'end'
  const [sessionStars, setSessionStars] = useState(0);
  const [celebration, setCelebration] = useState(null);
  const [guideIdx] = useState(() => Math.floor(Math.random() * GUIDES.length));
  const celebTimerRef = useRef(null);

  const sentence = queue[idx];

  const advance = useCallback(() => {
    setCelebration(null);
    setShowHint(false);
    setIdx((i) => {
      if (i + 1 >= queue.length) {
        setPhase('end');
        return i;
      }
      setPhase('play');
      return i + 1;
    });
  }, [queue.length]);

  const handleRead = useCallback(() => {
    if (phase !== 'play') return;
    setSessionStars((s) => s + 1);
    onStar();
    const finished = idx + 1;
    if (finished % CELEBRATE_EVERY === 0 || finished >= queue.length) {
      setCelebration(pick(CELEBRATIONS));
      setPhase('celebration');
      celebTimerRef.current = setTimeout(advance, 2600);
    } else {
      advance();
    }
  }, [phase, idx, queue.length, onStar, advance]);

  const handleHint = useCallback(() => {
    if (phase === 'play') setShowHint((h) => !h);
  }, [phase]);

  const handlePlayAgain = useCallback(() => {
    setQueue(shuffle(SENTENCES));
    setIdx(0);
    setShowHint(false);
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
        emoji="👸"
        subtitle="You read all the sentences!"
      />
    );
  }

  return (
    <div>
      <CelebrationOverlay celebration={celebration} stars={sessionStars} />

      <div className="game-container">
        <Header
          stars={totalStars}
          progressText={`Sentence ${idx + 1} of ${queue.length}`}
          title="👸 Sentences"
          onHome={onHome}
        />

        <div className="card-area">
          <div className="guide">{GUIDES[guideIdx]}</div>
          <SentencePhase sentence={sentence} showHint={showHint} />
        </div>

        <div className="buttons">
          <button className="btn btn-no" onClick={handleHint}>
            <span className="btn-icon">🖼️</span>
            <span>{showHint ? 'Hide picture' : 'Picture hint'}</span>
          </button>
          <button className="btn btn-yes" onClick={handleRead}>
            <span className="btn-icon">✨</span>
            <span>I read it!</span>
          </button>
        </div>
      </div>
    </div>
  );
}
