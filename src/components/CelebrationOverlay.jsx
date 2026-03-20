import Confetti from './Confetti';

export default function CelebrationOverlay({ celebration, stars }) {
  if (!celebration) return null;

  return (
    <>
      <Confetti />
      <div className="celebration">
        <div className="celebration-card">
          <div className="celebration-emoji">{celebration.emoji}</div>
          <div className="celebration-title">{celebration.title}</div>
          <div className="celebration-subtitle">{celebration.subtitle}</div>
          <div style={{ marginTop: 16, fontSize: 28 }}>
            {Array.from({ length: stars }, (_, i) => (
              <span key={i}>⭐</span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
