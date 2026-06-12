import { useState, useCallback, useRef, useEffect } from 'react';
import { CELEBRATIONS } from '../data/celebrations';
import { shuffle, randInt, pick } from '../utils/random';
import Header from '../components/Header';
import CelebrationOverlay from '../components/CelebrationOverlay';
import EndScreen from '../components/EndScreen';

const TOTAL_PROBLEMS = 10;
const CELEBRATE_EVERY = 5;
const COUNTER_EMOJIS = ['💖', '⭐', '🌸', '🦄', '🧁', '🦋'];

function makeProblem() {
  const counter = pick(COUNTER_EMOJIS);
  if (Math.random() < 0.6) {
    // Addition: keep operands countable on fingers, result always below 30
    const a = randInt(1, 10);
    const b = randInt(1, 10);
    return { a, b, op: '+', answer: a + b, counter };
  }
  // Subtraction: never goes negative
  const a = randInt(2, 10);
  const b = randInt(1, a - 1);
  return { a, b, op: '−', answer: a - b, counter };
}

function makeChoices(answer) {
  const opts = new Set([answer]);
  for (const d of shuffle([-3, -2, -1, 1, 2, 3])) {
    if (opts.size >= 3) break;
    const v = answer + d;
    if (v >= 0 && v < 30) opts.add(v);
  }
  return shuffle([...opts]);
}

export default function MathGame({ onHome, onStar, totalStars }) {
  const [problem, setProblem] = useState(makeProblem);
  const [choices, setChoices] = useState(() => makeChoices(problem.answer));
  const [problemIdx, setProblemIdx] = useState(0);
  const [wrongPicks, setWrongPicks] = useState([]);
  const [solved, setSolved] = useState(false);
  const [phase, setPhase] = useState('play'); // 'play' | 'celebration' | 'end'
  const [sessionStars, setSessionStars] = useState(0);
  const [celebration, setCelebration] = useState(null);
  const timerRef = useRef(null);

  const advance = useCallback(() => {
    setCelebration(null);
    setProblemIdx((i) => {
      if (i + 1 >= TOTAL_PROBLEMS) {
        setPhase('end');
        return i;
      }
      const next = makeProblem();
      setProblem(next);
      setChoices(makeChoices(next.answer));
      setWrongPicks([]);
      setSolved(false);
      setPhase('play');
      return i + 1;
    });
  }, []);

  const handlePick = useCallback((value) => {
    if (phase !== 'play' || solved) return;
    if (value !== problem.answer) {
      setWrongPicks((w) => (w.includes(value) ? w : [...w, value]));
      return;
    }
    setSolved(true);
    setSessionStars((s) => s + 1);
    onStar();
    const finished = problemIdx + 1;
    if (finished % CELEBRATE_EVERY === 0 || finished >= TOTAL_PROBLEMS) {
      setCelebration(pick(CELEBRATIONS));
      setPhase('celebration');
      timerRef.current = setTimeout(advance, 2400);
    } else {
      timerRef.current = setTimeout(advance, 900);
    }
  }, [phase, solved, problem, problemIdx, onStar, advance]);

  const handlePlayAgain = useCallback(() => {
    const next = makeProblem();
    setProblem(next);
    setChoices(makeChoices(next.answer));
    setProblemIdx(0);
    setWrongPicks([]);
    setSolved(false);
    setPhase('play');
    setSessionStars(0);
    setCelebration(null);
  }, []);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  if (phase === 'end') {
    return (
      <EndScreen
        stars={sessionStars}
        onPlayAgain={handlePlayAgain}
        onHome={onHome}
        emoji="😺"
        subtitle="You are a math superstar!"
      />
    );
  }

  const { a, b, op, answer, counter } = problem;

  return (
    <div>
      <CelebrationOverlay celebration={celebration} stars={sessionStars} />

      <div className="game-container">
        <Header
          stars={totalStars}
          progressText={`Problem ${problemIdx + 1} of ${TOTAL_PROBLEMS}`}
          title="😺 Math"
          onHome={onHome}
        />

        <div className="card-area">
          <div className="math-card">
            <div className="math-equation">
              <span className="math-num">{a}</span>
              <span className="math-op">{op}</span>
              <span className="math-num">{b}</span>
              <span className="math-op">=</span>
              <span className={`math-num math-answer ${solved ? 'revealed' : ''}`}>
                {solved ? answer : '?'}
              </span>
            </div>

            <div className="math-visual">
              {op === '+' ? (
                <>
                  <div className="math-group">
                    {Array.from({ length: a }, (_, i) => (
                      <span key={i} className="math-item">{counter}</span>
                    ))}
                  </div>
                  <span className="math-visual-op">➕</span>
                  <div className="math-group">
                    {Array.from({ length: b }, (_, i) => (
                      <span key={i} className="math-item">{counter}</span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="math-group">
                  {Array.from({ length: a }, (_, i) => (
                    <span
                      key={i}
                      className={`math-item ${i >= a - b ? 'taken' : ''}`}
                    >
                      {counter}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="choice-row">
            {choices.map((value) => (
              <button
                key={value}
                className={`choice-btn ${wrongPicks.includes(value) ? 'wrong' : ''} ${
                  solved && value === answer ? 'correct' : ''
                }`}
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
