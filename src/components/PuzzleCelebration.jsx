import { useMemo } from 'react';
import Confetti from './Confetti';

export const PUZZLE_SHOWS = {
  rainbow: {
    title: 'Rainbow Magic!',
    subtitle: 'You solved the whole puzzle! 🌈',
    floaters: ['☁️', '✨', '💖', '⭐', '🦋'],
  },
  unicorn: {
    title: 'Unicorn Dance!',
    subtitle: 'The unicorns are dancing for you! 🦄',
    floaters: ['🌈', '✨', '💜', '⭐', '💖'],
  },
  princess: {
    title: 'Princess Party!',
    subtitle: 'The princess gives you a crown! 👑',
    floaters: ['💎', '✨', '🌸', '👑', '💖'],
  },
};

const RAINBOW = ['#FF5E7E', '#FF9F43', '#FFD93D', '#6BCB77', '#4D96FF', '#9B5DE5', '#F15BB5'];

function RainbowShow() {
  return (
    <div className="pc-stage">
      <div className="pc-rainbow">
        {RAINBOW.map((color, i) => (
          <span
            key={color}
            className="pc-arc"
            style={{ '--i': i, borderColor: color, animationDelay: `${i * 0.15}s` }}
          />
        ))}
        <span className="pc-cloud pc-cloud-left">☁️</span>
        <span className="pc-cloud pc-cloud-right">☁️</span>
      </div>
    </div>
  );
}

function UnicornShow() {
  return (
    <div className="pc-stage">
      <div className="pc-unicorn-run">
        <span>🦄</span>
        <span>🌈✨</span>
      </div>
      <div className="pc-unicorn-star">🦄</div>
    </div>
  );
}

function PrincessShow() {
  return (
    <div className="pc-stage">
      <div className="pc-castle">🏰</div>
      <div className="pc-princess">
        <span className="pc-crown">👑</span>
        <span>👸</span>
      </div>
    </div>
  );
}

const STAGES = { rainbow: RainbowShow, unicorn: UnicornShow, princess: PrincessShow };

export default function PuzzleCelebration({ kind, stars, isLast, onNext, onHome }) {
  const show = PUZZLE_SHOWS[kind];
  const floaters = useMemo(() => {
    if (!show) return [];
    return Array.from({ length: 16 }, (_, i) => ({
      id: i,
      emoji: show.floaters[i % show.floaters.length],
      left: Math.random() * 90 + 5,
      delay: Math.random() * 2.5,
      duration: 3 + Math.random() * 2,
      size: 22 + Math.random() * 26,
    }));
  }, [show]);

  if (!show) return null;
  const Stage = STAGES[kind];

  return (
    <div className="reward-overlay pc-overlay">
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
      <div className="reward-banner">🧩 PUZZLE DONE! 🧩</div>
      <Stage />
      <div className="reward-title">{show.title}</div>
      <div className="reward-subtitle">{show.subtitle}</div>
      <div className="pc-stars">⭐ {stars}</div>
      <div className="end-buttons">
        <button className="btn-end-home" onClick={onHome} aria-label="Back to menu">
          🏠
        </button>
        <button className="btn-play-again" onClick={onNext}>
          {isLast ? '✨ All Done! ✨' : 'Next Puzzle ➡️'}
        </button>
      </div>
    </div>
  );
}
