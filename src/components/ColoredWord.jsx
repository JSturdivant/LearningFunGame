import { classifyLetters } from '../utils/phonetics';

export default function ColoredWord({ word, small = false }) {
  const letters = classifyLetters(word);
  return (
    <div className="word-display">
      {letters.map((l, i) => (
        <span
          key={i}
          className={`letter ${l.type}`}
          style={small ? { fontSize: 'clamp(18px, 5vw, 28px)' } : undefined}
        >
          {l.ch}
        </span>
      ))}
    </div>
  );
}
