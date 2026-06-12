export default function Header({ stars, progressText, title, onHome }) {
  return (
    <div className="header">
      <button className="home-btn" onClick={onHome} aria-label="Back to menu">
        🏠
      </button>
      <div className="stars-display">
        <span>⭐</span>
        <span>{stars}</span>
      </div>
      <div className="progress-text">{progressText}</div>
      <div className="title-text">{title}</div>
    </div>
  );
}
