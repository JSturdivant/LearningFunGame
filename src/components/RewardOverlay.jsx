import { useMemo } from 'react';
import Confetti from './Confetti';

export default function RewardOverlay({ treat, onClose }) {
  const floaters = useMemo(() => {
    if (!treat) return [];
    return Array.from({ length: 14 }, (_, i) => ({
      id: i,
      emoji: treat.floaters[i % treat.floaters.length],
      left: Math.random() * 90 + 5,
      delay: Math.random() * 2,
      duration: 2.5 + Math.random() * 2,
      size: 24 + Math.random() * 28,
    }));
  }, [treat]);

  if (!treat) return null;

  return (
    <div className="reward-overlay">
      <Confetti />
      {floaters.map((f) => (
        <span
          key={f.id}
          className="reward-floater"
          style={{
            left: `${f.left}%`,
            fontSize: f.size,
            animationDelay: `${f.delay}s`,
            animationDuration: `${f.duration}s`,
          }}
        >
          {f.emoji}
        </span>
      ))}
      <div className="reward-banner">🎁 TREAT TIME! 🎁</div>
      <div className="reward-parade">
        {treat.emojis.map((e, i) => (
          <span
            key={i}
            className="reward-emoji"
            style={{ animationDelay: `${i * 0.18}s` }}
          >
            {e}
          </span>
        ))}
      </div>
      <div className="reward-title">{treat.title}</div>
      <div className="reward-subtitle">{treat.subtitle}</div>
      <button className="reward-btn" onClick={onClose} aria-label="Keep playing">
        💖
      </button>
    </div>
  );
}
