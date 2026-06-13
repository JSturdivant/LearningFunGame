import ColoredWord from './ColoredWord';

export default function SentencePhase({ sentence, showHint }) {
  return (
    <div className="full-sentence-card">
      <div className="full-sentence-label">✨ Read the sentence! ✨</div>
      <div className="sentence-words">
        {sentence.text.split(' ').map((w, i) => (
          <ColoredWord key={i} word={w} small />
        ))}
      </div>
      {showHint && (
        <div className="sentence-hint">
          <div className="sentence-hint-pics">
            {sentence.pictures.map((p, i) => (
              <span key={i} className="sentence-hint-emoji">{p}</span>
            ))}
          </div>
          <div className="sentence-hint-label">👆 picture clue</div>
        </div>
      )}
    </div>
  );
}
