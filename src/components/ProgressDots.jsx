export default function ProgressDots({ words, currentIdx }) {
  return (
    <div className="word-dots">
      {words.map((_, i) => (
        <div
          key={i}
          className={`word-dot ${i < currentIdx ? 'done' : i === currentIdx ? 'current' : ''}`}
        />
      ))}
    </div>
  );
}
