export default function SentencePhase({ sentence }) {
  return (
    <div className="full-sentence-card">
      <div className="full-sentence-label">✨ Read the sentence! ✨</div>
      <div className="full-sentence-text">{sentence.words.join(' ')}</div>
    </div>
  );
}
