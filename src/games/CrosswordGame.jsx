import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { CROSSWORDS } from '../data/crosswords';
import { buildPuzzle, cellKey } from '../utils/crossword';
import { shuffle, pick } from '../utils/random';
import Header from '../components/Header';
import EndScreen from '../components/EndScreen';
import PuzzleCelebration, { PUZZLE_SHOWS } from '../components/PuzzleCelebration';

// Typing goes through a hidden input so the device's own keyboard pops up.
// It always holds this invisible character, so a shorter value means the
// erase key was pressed (iOS doesn't reliably send Backspace on an empty box).
const SENTINEL = '\u200B';
const ARROWS = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
const BURST_MS = 1600;
const WRONG_MS = 900;

const keyOf = ([r, c]) => cellKey(r, c);

function startOf(puzzle) {
  const e = puzzle.entries[0];
  return { r: e.cells[0][0], c: e.cells[0][1], dir: e.dir };
}

export default function CrosswordGame({ onHome, onStar, totalStars }) {
  const [order, setOrder] = useState(() => shuffle(CROSSWORDS));
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const puzzle = useMemo(() => buildPuzzle(order[puzzleIdx]), [order, puzzleIdx]);
  const [letters, setLetters] = useState({});
  const [solved, setSolved] = useState([]);
  const [selection, setSel] = useState(null);
  const [wrong, setWrong] = useState([]);
  const [bursts, setBursts] = useState([]);
  const [phase, setPhase] = useState('play'); // 'play' | 'finishing' | 'done' | 'end'
  const [show, setShow] = useState(null);
  const [sessionStars, setSessionStars] = useState(0);
  const timersRef = useRef([]);
  const gridRef = useRef(null);
  const inputRef = useRef(null);
  const [typing, setTyping] = useState(false);
  const [viewHeight, setViewHeight] = useState(null);
  const burstSeqRef = useRef(0);

  const later = useCallback((fn, ms) => {
    timersRef.current.push(setTimeout(fn, ms));
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const sel = selection ?? startOf(puzzle);
  const curKey = cellKey(sel.r, sel.c);
  const curEntries = puzzle.cellEntries[curKey];
  const active = puzzle.entryById[curEntries[sel.dir] ?? curEntries.across ?? curEntries.down];
  const curIdx = active.cells.findIndex(([r, c]) => r === sel.r && c === sel.c);

  const locked = useMemo(() => {
    const s = new Set();
    solved.forEach((id) => puzzle.entryById[id].cells.forEach((cell) => s.add(keyOf(cell))));
    return s;
  }, [solved, puzzle]);

  const selectEntry = useCallback((entry, lockedSet = locked, current = letters) => {
    const free = entry.cells.filter((cell) => !lockedSet.has(keyOf(cell)));
    const target = free.find((cell) => !current[keyOf(cell)]) ?? free[0] ?? entry.cells[0];
    setSel({ r: target[0], c: target[1], dir: entry.dir });
  }, [locked, letters]);

  // Applies a new set of letters, then checks for solved / wrong answers and
  // moves the cursor along like a real crossword app would.
  const commit = useCallback((next, changedKey, entry, idx) => {
    const isRight = ([r, c]) => next[cellKey(r, c)] === puzzle.cells[r][c].answer;
    const newly = puzzle.entries.filter((e) =>
      !solved.includes(e.id) &&
      e.cells.some((cell) => keyOf(cell) === changedKey) &&
      e.cells.every(isRight));
    const entryFull = entry.cells.every((cell) => next[keyOf(cell)]);
    const wrongKeys = entryFull && !newly.includes(entry)
      ? entry.cells.filter((cell) => !isRight(cell)).map(keyOf)
      : [];

    setLetters(next);

    const solvedNow = [...solved, ...newly.map((e) => e.id)];
    const lockedNow = new Set(locked);
    newly.forEach((e) => e.cells.forEach((cell) => lockedNow.add(keyOf(cell))));

    if (newly.length) {
      setSolved(solvedNow);
      newly.forEach(() => onStar({ treat: false }));
      setSessionStars((s) => s + newly.length);
      const id = ++burstSeqRef.current;
      setBursts((b) => [...b, { id, entries: newly }]);
      later(() => setBursts((b) => b.filter((x) => x.id !== id)), BURST_MS);

      if (solvedNow.length === puzzle.entries.length) {
        setPhase('finishing');
        later(() => {
          setShow(pick(Object.keys(PUZZLE_SHOWS)));
          setPhase('done');
        }, BURST_MS);
        return;
      }
    }

    if (wrongKeys.length) {
      setWrong(wrongKeys);
      later(() => {
        setWrong([]);
        setLetters((l) => {
          const n = { ...l };
          wrongKeys.forEach((k) => { if (n[k] === next[k]) delete n[k]; });
          return n;
        });
      }, WRONG_MS);
      const [r, c] = wrongKeys[0].split(',').map(Number);
      setSel({ r, c, dir: entry.dir });
      return;
    }

    if (solvedNow.includes(entry.id)) {
      const list = puzzle.entries;
      const start = list.indexOf(entry);
      for (let i = 1; i < list.length; i++) {
        const e = list[(start + i) % list.length];
        if (!solvedNow.includes(e.id)) {
          selectEntry(e, lockedNow, next);
          return;
        }
      }
      return;
    }

    const n = entry.cells.length;
    const isFree = (i) => !lockedNow.has(keyOf(entry.cells[i]));
    let target = -1;
    for (let step = 1; step < n && target < 0; step++) {
      const i = (idx + step) % n;
      if (isFree(i) && !next[keyOf(entry.cells[i])]) target = i;
    }
    for (let i = idx + 1; i < n && target < 0; i++) {
      if (isFree(i)) target = i;
    }
    if (target >= 0) {
      const [r, c] = entry.cells[target];
      setSel({ r, c, dir: entry.dir });
    }
  }, [puzzle, solved, locked, onStar, later, selectEntry]);

  const typeLetter = useCallback((ch) => {
    if (phase !== 'play') return;
    const n = active.cells.length;
    let target = -1;
    for (let step = 0; step < n && target < 0; step++) {
      const i = (curIdx + step) % n;
      if (!locked.has(keyOf(active.cells[i]))) target = i;
    }
    if (target < 0) return;
    const k = keyOf(active.cells[target]);
    commit({ ...letters, [k]: ch }, k, active, target);
  }, [phase, active, curIdx, locked, letters, commit]);

  const giveHint = useCallback(() => {
    if (phase !== 'play') return;
    const target = active.cells.findIndex(([r, c]) =>
      letters[cellKey(r, c)] !== puzzle.cells[r][c].answer);
    if (target < 0) return;
    const [r, c] = active.cells[target];
    const k = cellKey(r, c);
    commit({ ...letters, [k]: puzzle.cells[r][c].answer }, k, active, target);
  }, [phase, active, letters, puzzle, commit]);

  const backspace = useCallback(() => {
    if (phase !== 'play') return;
    if (letters[curKey] && !locked.has(curKey)) {
      const n = { ...letters };
      delete n[curKey];
      setLetters(n);
      return;
    }
    for (let i = curIdx - 1; i >= 0; i--) {
      const k = keyOf(active.cells[i]);
      if (locked.has(k)) continue;
      const n = { ...letters };
      delete n[k];
      setLetters(n);
      setSel({ r: active.cells[i][0], c: active.cells[i][1], dir: active.dir });
      return;
    }
  }, [phase, letters, curKey, curIdx, locked, active]);

  const tapCell = useCallback((r, c) => {
    const ents = puzzle.cellEntries[cellKey(r, c)];
    if (r === sel.r && c === sel.c) {
      const other = sel.dir === 'across' ? 'down' : 'across';
      if (ents[other]) setSel({ r, c, dir: other });
      return;
    }
    setSel({ r, c, dir: ents[sel.dir] ? sel.dir : ents.across ? 'across' : 'down' });
  }, [puzzle, sel]);

  const moveArrow = useCallback((dr, dc) => {
    const r = sel.r + dr;
    const c = sel.c + dc;
    if (!puzzle.cells[r]?.[c]) return;
    const dir = dc ? 'across' : 'down';
    const ents = puzzle.cellEntries[cellKey(r, c)];
    setSel({ r, c, dir: ents[dir] ? dir : sel.dir });
  }, [puzzle, sel]);

  const stepClue = useCallback((delta) => {
    const list = puzzle.entries;
    const i = list.indexOf(active);
    selectEntry(list[(i + delta + list.length) % list.length]);
  }, [puzzle, active, selectEntry]);

  const focusInput = useCallback(() => inputRef.current?.focus(), []);

  const handleInput = useCallback((ev) => {
    const input = ev.target;
    const value = input.value;
    input.value = SENTINEL;
    input.setSelectionRange(1, 1);
    if (!value.includes(SENTINEL)) {
      backspace();
      return;
    }
    const typed = value.replace(SENTINEL, '').toUpperCase().replace(/[^A-Z]/g, '');
    if (typed) typeLetter(typed[typed.length - 1]);
  }, [backspace, typeLetter]);

  const handleInputKey = useCallback((ev) => {
    if (ARROWS[ev.key]) {
      ev.preventDefault();
      moveArrow(...ARROWS[ev.key]);
    } else if (ev.key === 'Enter') {
      ev.preventDefault();
      stepClue(1);
    }
  }, [moveArrow, stepClue]);

  // Close the keyboard while the puzzle party plays.
  useEffect(() => {
    if (phase !== 'play') inputRef.current?.blur();
  }, [phase]);

  // When the on-screen keyboard opens, shrink the game to the part of the
  // screen that's still showing and keep the selected square in view.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return undefined;
    const onResize = () => {
      setViewHeight(vv.height);
      window.scrollTo(0, 0);
    };
    onResize();
    vv.addEventListener('resize', onResize);
    return () => vv.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    gridRef.current?.querySelector('.cw-cell.selected')?.scrollIntoView({ block: 'nearest' });
  }, [curKey, viewHeight]);

  // A physical keyboard (iPad keyboard case, computer) works even before a
  // square is tapped; once the hidden input has focus it handles the keys.
  const handlersRef = useRef();
  handlersRef.current = { typeLetter, backspace, moveArrow };
  useEffect(() => {
    const onKey = (ev) => {
      if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
      if (ev.target === inputRef.current) return;
      const h = handlersRef.current;
      if (/^[a-z]$/i.test(ev.key)) h.typeLetter(ev.key.toUpperCase());
      else if (ev.key === 'Backspace') h.backspace();
      else if (ARROWS[ev.key]) h.moveArrow(...ARROWS[ev.key]);
      else return;
      ev.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const resetBoard = useCallback(() => {
    clearTimers();
    setLetters({});
    setSolved([]);
    setSel(null);
    setWrong([]);
    setBursts([]);
    setShow(null);
    setPhase('play');
  }, [clearTimers]);

  const handleNext = useCallback(() => {
    if (puzzleIdx + 1 >= order.length) {
      setPhase('end');
      return;
    }
    resetBoard();
    setPuzzleIdx((i) => i + 1);
  }, [puzzleIdx, order.length, resetBoard]);

  const handlePlayAgain = useCallback(() => {
    resetBoard();
    setOrder(shuffle(CROSSWORDS));
    setPuzzleIdx(0);
    setSessionStars(0);
  }, [resetBoard]);

  if (phase === 'end') {
    return (
      <EndScreen
        stars={sessionStars}
        onPlayAgain={handlePlayAgain}
        onHome={onHome}
        emoji="🧩"
        subtitle="You solved every crossword!"
      />
    );
  }

  const activeKeys = new Set(active.cells.map(keyOf));
  const popDelay = {};
  bursts.forEach((b) => b.entries.forEach((e) => e.cells.forEach((cell, i) => {
    popDelay[keyOf(cell)] = i * 0.08;
  })));
  const pct = (n, total) => `${((n + 0.5) / total) * 100}%`;

  return (
    <div>
      {phase === 'done' && (
        <PuzzleCelebration
          kind={show}
          stars={sessionStars}
          isLast={puzzleIdx + 1 >= order.length}
          onNext={handleNext}
          onHome={onHome}
        />
      )}

      <div
        className="game-container cw-container"
        style={viewHeight ? { height: viewHeight } : undefined}
      >
        <Header
          stars={totalStars}
          progressText={`Puzzle ${puzzleIdx + 1} of ${order.length}`}
          title="🧩 Crossword"
          onHome={onHome}
        />

        <div className="cw-puzzle-title">
          {puzzle.emoji} {puzzle.title}
          <span className="cw-puzzle-count">⭐ {solved.length} / {puzzle.entries.length}</span>
          <button
            className="cw-hint"
            onClick={() => { giveHint(); focusInput(); }}
            aria-label="Hint"
          >
            💡
          </button>
        </div>

        <div className={`cw-cluebar ${solved.includes(active.id) ? 'solved' : ''}`}>
          <button className="cw-nav" onClick={() => { stepClue(-1); focusInput(); }} aria-label="Previous clue">◀</button>
          <div className="cw-clue-current">
            <span className="cw-clue-emoji">{active.emoji}</span>
            <div>
              <div className="cw-clue-label">
                {active.number} {active.dir === 'across' ? '➡️ Across' : '⬇️ Down'}
                {solved.includes(active.id) && ' ⭐'}
              </div>
              <div className="cw-clue-text">{active.clue}</div>
            </div>
          </div>
          <button className="cw-nav" onClick={() => { stepClue(1); focusInput(); }} aria-label="Next clue">▶</button>
        </div>

        <div className="cw-scroll">
          {!typing && phase === 'play' && (
            <div className="cw-tap-hint">👆 Tap a square to type</div>
          )}
          <div
            ref={gridRef}
            className="cw-grid-wrap"
            style={{ '--cols': puzzle.cols, '--rows': puzzle.rows }}
          >
            <div className="cw-grid">
              {puzzle.cells.map((row, r) => row.map((cell, c) => {
                const k = cellKey(r, c);
                if (!cell) return <div key={k} className="cw-block" />;
                const classes = ['cw-cell'];
                if (activeKeys.has(k)) classes.push('in-word');
                if (k === curKey) classes.push('selected');
                if (locked.has(k)) classes.push('solved');
                if (wrong.includes(k)) classes.push('wrong');
                if (k in popDelay) classes.push('pop');
                return (
                  <button
                    key={k}
                    className={classes.join(' ')}
                    style={k in popDelay ? { animationDelay: `${popDelay[k]}s` } : undefined}
                    onClick={() => { tapCell(r, c); focusInput(); }}
                    aria-label={`Square ${r + 1}, ${c + 1}`}
                  >
                    {cell.number && <span className="cw-num">{cell.number}</span>}
                    <span className="cw-letter">{letters[k]}</span>
                  </button>
                );
              }))}
            </div>

            <input
              ref={inputRef}
              className="cw-input"
              style={{
                left: `${(sel.c / puzzle.cols) * 100}%`,
                top: `${(sel.r / puzzle.rows) * 100}%`,
                height: `${100 / puzzle.rows}%`,
              }}
              defaultValue={SENTINEL}
              onInput={handleInput}
              onKeyDown={handleInputKey}
              onFocus={() => setTyping(true)}
              onBlur={() => setTyping(false)}
              autoCapitalize="characters"
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="next"
              aria-label="Type a letter"
            />

            <div className="cw-bursts">
              {bursts.map((b) => b.entries.map((e) => e.cells.map(([r, c], i) => (
                <span
                  key={`${b.id}-${e.id}-${i}`}
                  className="cw-burst-star"
                  style={{
                    left: pct(c, puzzle.cols),
                    top: pct(r, puzzle.rows),
                    animationDelay: `${i * 0.08}s`,
                  }}
                >
                  ⭐
                </span>
              ))))}
              {bursts.map((b) => (
                <div key={b.id} className="cw-word-pop">
                  ⭐ {b.entries.map((e) => e.answer).join(' + ')} ⭐
                </div>
              ))}
            </div>
          </div>

          <div className="cw-lists">
            {[['➡️ Across', puzzle.across], ['⬇️ Down', puzzle.down]].map(([label, list]) => (
              <div key={label} className="cw-list">
                <div className="cw-list-title">{label}</div>
                {list.map((e) => (
                  <button
                    key={e.id}
                    className={`cw-list-item ${e.id === active.id ? 'active' : ''} ${solved.includes(e.id) ? 'solved' : ''}`}
                    onClick={() => {
                      selectEntry(e);
                      focusInput();
                      gridRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                    }}
                  >
                    <b className="cw-list-num">{e.number}</b>
                    <span className="cw-list-emoji">{e.emoji}</span>
                    <span className="cw-list-clue">{e.clue}</span>
                    {solved.includes(e.id) && <span>⭐</span>}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
