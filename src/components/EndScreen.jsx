import StarBackground from './StarBackground';

export default function EndScreen({ stars, onPlayAgain }) {
  return (
    <div>
      <StarBackground />
      <div className="end-screen">
        <div className="end-card">
          <div style={{ fontSize: 72 }}>🦄</div>
          <div className="end-title">You Did It!</div>
          <div className="end-subtitle">You read all the sentences!</div>
          <div className="end-stars">
            {Array.from({ length: Math.min(stars, 10) }, (_, i) => (
              <span key={i}>⭐</span>
            ))}
          </div>
          <div style={{ color: '#E8C4F0', fontSize: 20, marginBottom: 8 }}>
            {stars} gold stars earned! 🌟
          </div>
          <button className="btn-play-again" onClick={onPlayAgain}>
            ✨ Play Again! ✨
          </button>
        </div>
      </div>
    </div>
  );
}
