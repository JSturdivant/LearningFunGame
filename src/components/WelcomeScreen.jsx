const MODES = [
  { id: 'flashcards', icon: '🔤', friend: '🦄', label: 'Words',     className: 'menu-card-pink' },
  { id: 'sentences',  icon: '📖', friend: '👸', label: 'Sentences', className: 'menu-card-purple' },
  { id: 'counting',   icon: '🔢', friend: '🌈', label: 'Counting',  className: 'menu-card-magenta' },
  { id: 'math',       icon: '➕', friend: '😺', label: 'Math',      className: 'menu-card-violet' },
];

export default function WelcomeScreen({ totalStars, onPick }) {
  return (
    <div className="welcome">
      <div className="welcome-header">
        <div className="welcome-crown">👑</div>
        <h1 className="welcome-title">Princess Learning Fun</h1>
        <div className="welcome-sub">✨ Pick a game! ✨</div>
        {totalStars > 0 && (
          <div className="welcome-stars">⭐ {totalStars}</div>
        )}
      </div>
      <div className="menu-grid">
        {MODES.map((m) => (
          <button
            key={m.id}
            className={`menu-card ${m.className}`}
            onClick={() => onPick(m.id)}
          >
            <span className="menu-card-friend">{m.friend}</span>
            <span className="menu-card-icon">{m.icon}</span>
            <span className="menu-card-label">{m.label}</span>
          </button>
        ))}
      </div>
      <div className="welcome-footer">🦄 🌈 😺 👸 🦋 🌸</div>
    </div>
  );
}
