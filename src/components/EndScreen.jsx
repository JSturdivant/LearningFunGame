export default function EndScreen({
  stars,
  onPlayAgain,
  onHome,
  emoji = '🦄',
  title = 'You Did It!',
  subtitle = 'You finished the whole game!',
}) {
  return (
    <div className="end-screen">
      <div className="end-card">
        <div style={{ fontSize: 72 }}>{emoji}</div>
        <div className="end-title">{title}</div>
        <div className="end-subtitle">{subtitle}</div>
        <div className="end-stars">
          {Array.from({ length: Math.min(stars, 10) }, (_, i) => (
            <span key={i}>⭐</span>
          ))}
        </div>
        <div style={{ color: '#E8C4F0', fontSize: 20, marginBottom: 8 }}>
          {stars} gold stars earned! 🌟
        </div>
        <div className="end-buttons">
          <button className="btn-end-home" onClick={onHome} aria-label="Back to menu">
            🏠
          </button>
          <button className="btn-play-again" onClick={onPlayAgain}>
            ✨ Play Again! ✨
          </button>
        </div>
      </div>
    </div>
  );
}
