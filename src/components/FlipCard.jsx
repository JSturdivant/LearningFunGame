import ColoredWord from './ColoredWord';

export default function FlipCard({ word, hint, flipped, onFlip }) {
  return (
    <div
      className={`flip-card-wrapper ${flipped ? 'flipped' : ''}`}
      onClick={onFlip}
    >
      <div className="flip-card-inner">
        <div className="flip-card-front">
          <ColoredWord word={word} />
          <div className="tap-hint">tap for hint 👆</div>
        </div>
        <div className="flip-card-back">
          <div className="picture-hint">
            <div className="hint-emoji">{hint.emoji}</div>
            <div className="hint-word">{word}</div>
            <div className="hint-sound">🔊 {hint.sound}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
