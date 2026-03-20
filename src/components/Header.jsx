import { SENTENCES } from '../data/sentences';

export default function Header({ stars, sentenceIdx }) {
  return (
    <div className="header">
      <div className="stars-display">
        <span>⭐</span>
        <span>{stars}</span>
      </div>
      <div className="progress-text">
        Sentence {sentenceIdx + 1} of {SENTENCES.length}
      </div>
      <div className="title-text">👑 Reader</div>
    </div>
  );
}
