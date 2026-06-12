import { useState, useCallback, useRef, useEffect } from 'react';
import { CELEBRATIONS } from '../data/celebrations';
import { shuffle, randInt, pick } from '../utils/random';
import Header from '../components/Header';
import CelebrationOverlay from '../components/CelebrationOverlay';
import EndScreen from '../components/EndScreen';

const STEPS_PER_ROUND = 10;
const TOTAL_ROUNDS = 3;

function makeChoices(correct) {
  const opts = new Set([correct]);
  for (const d of shuffle([-2, -1, 1, 2, 3, 10])) {
    if (opts.size >= 3) break;
    const v = correct + d;
    if (v >= 1) opts.add(v);
  }
  return shuffle([...opts]);
}

function newRound() {
  const start = randInt(1, 99 - STEPS_PER_ROUND);
  return { start, current: start, choices: makeChoices(start + 1) };
}

export default function CountingGame({ onHome, onStar, totalStars }) {
  const [round, setRound] = useState(1);
  const [state, setState] = useState(newRound);
  const [wrongPicks, setWrongPicks] = useState([]);
  const [phase, setPhase] = useState('play'); // 'play' | 'celebration' | 'end'
  const [sessionStars, setSessionStars] = useState(0);
  const [celebration, setCelebration] = useState(null);
  const celebTimerRef = useRef(null);

  const { start, current, choices } = state;
  const stepsDone = current - start;

  const handlePick = useCallback((value) => {
    if (phase !== 'play') return;
    if (value !== current + 1) {
      setWrongPicks((w) => (w.includes(value) ? w : [...w, value]));
      return;
    }
    const next = current + 1;
    setWrongPicks([]);
    if (next - start >= STEPS_PER_ROUND) {
      setSessionStars((s) => s + 1);
      onStar();
      setCelebration(pick(CELEBRATIONS));
      setPhase('celebration');
      setState((st) => ({ ...st, current: next }));
      celebTimerRef.current = setTimeout(() => {
        setCelebration(null);
        if (round >= TOTAL_ROUNDS) {
          setPhase('end');
        } else {
          setRound((r) => r + 1);
          setState(newRound());
          setPhase('play');
        }
      }, 2800);
    } else {
      setState({ start, current: next, choices: makeChoices(next + 1) });
    }
  }, [phase, current, start, round, onStar]);

  const handlePlayAgain = useCallback(() => {
    setRound(1);
    setState(newRound());
    setWrongPicks([]);
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
        emoji="🌈"
        subtitle="You counted like a champion!"
      />
    );
  }

  const trailStart = Math.max(start, current - 3);
  const trail = [];
  for (let n = trailStart; n <= current; n++) trail.push(n);

  return (
    <div>
      <CelebrationOverlay celebration={celebration} stars={sessionStars} />

      <div className="game-container">
        <Header
          stars={totalStars}
          progressText={`Round ${round} of ${TOTAL_ROUNDS}`}
          title="🌈 Counting"
          onHome={onHome}
        />

        <div className="card-area">
          <div className="count-hearts">
            {Array.from({ length: STEPS_PER_ROUND }, (_, i) => (
              <span key={i} className={`count-heart ${i < stepsDone ? 'filled' : ''}`}>
                {i < stepsDone ? '💖' : '🤍'}
              </span>
            ))}
          </div>

          <div className="count-card">
            <div className="count-trail">
              {trail.map((n) => (
                <span key={n} className={`count-chip ${n === current ? 'current' : ''}`}>
                  {n}
                </span>
              ))}
              <span className="count-chip mystery">?</span>
            </div>
            <div className="count-prompt">🦄 What comes next?</div>
          </div>

          <div className="choice-row">
            {choices.map((value) => (
              <button
                key={value}
                className={`choice-btn ${wrongPicks.includes(value) ? 'wrong' : ''}`}
                onClick={() => handlePick(value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
