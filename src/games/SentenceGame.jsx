import { useState, useCallback, useRef, useEffect } from 'react';
import { SENTENCES } from '../data/sentences';
import { CELEBRATIONS, GUIDES } from '../data/celebrations';
import { shuffle, pick } from '../utils/random';
import Header from '../components/Header';
import WordPhase from '../components/WordPhase';
import SentencePhase from '../components/SentencePhase';
import CelebrationOverlay from '../components/CelebrationOverlay';
import EndScreen from '../components/EndScreen';

export default function SentenceGame({ onHome, onStar, totalStars }) {
  const [queue, setQueue] = useState(() => shuffle(SENTENCES));
  const [sentenceIdx, setSentenceIdx] = useState(0);
  const [wordIdx, setWordIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [phase, setPhase] = useState('word'); // 'word' | 'fullSentence' | 'celebration' | 'end'
  const [sessionStars, setSessionStars] = useState(0);
  const [celebration, setCelebration] = useState(null);
  const [guideIdx] = useState(() => Math.floor(Math.random() * GUIDES.length));
  const celebTimerRef = useRef(null);

  const sentence = queue[sentenceIdx];

  const handleFlip = useCallback(() => {
    if (phase === 'word') setFlipped((f) => !f);
  }, [phase]);

  const handleYes = useCallback(() => {
    if (phase === 'word') {
      const nextWord = wordIdx + 1;
      if (nextWord >= sentence.words.length) {
        setPhase('fullSentence');
        setFlipped(false);
      } else {
        setWordIdx(nextWord);
        setFlipped(false);
      }
    } else if (phase === 'fullSentence') {
      setCelebration(pick(CELEBRATIONS));
      setPhase('celebration');
      setSessionStars((s) => s + 1);
      onStar();
      celebTimerRef.current = setTimeout(() => {
        setCelebration(null);
        const next = sentenceIdx + 1;
        if (next >= queue.length) {
          setPhase('end');
        } else {
          setSentenceIdx(next);
          setWordIdx(0);
          setFlipped(false);
          setPhase('word');
        }
      }, 2800);
    }
  }, [phase, wordIdx, sentence, sentenceIdx, queue, onStar]);

  const handleNo = useCallback(() => {
    if (phase === 'word') {
      setFlipped(true);
    } else if (phase === 'fullSentence') {
      setWordIdx(0);
      setFlipped(false);
      setPhase('word');
    }
  }, [phase]);

  const handlePlayAgain = useCallback(() => {
    setQueue(shuffle(SENTENCES));
    setSentenceIdx(0);
    setWordIdx(0);
    setFlipped(false);
    setPhase('word');
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
          progressText={`Sentence ${sentenceIdx + 1} of ${queue.length}`}
          title="👸 Sentences"
          onHome={onHome}
        />

        <div className="card-area">
          <div className="guide">{GUIDES[guideIdx]}</div>

          {phase === 'word' && (
            <WordPhase
              sentence={sentence}
              wordIdx={wordIdx}
              flipped={flipped}
              onFlip={handleFlip}
            />
          )}

          {(phase === 'fullSentence' || phase === 'celebration') && (
            <SentencePhase sentence={sentence} />
          )}
        </div>

        <div className="buttons">
          <button className="btn btn-no" onClick={handleNo}>
            <span className="btn-icon">🔄</span>
            <span>{phase === 'word' ? 'Help me' : 'Try again'}</span>
          </button>
          <button className="btn btn-yes" onClick={handleYes}>
            <span className="btn-icon">✨</span>
            <span>{phase === 'word' ? 'I read it!' : 'I said it!'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
