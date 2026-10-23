export const cellKey = (r, c) => `${r},${c}`;

/**
 * Turns a puzzle from data/crosswords.js into a playable board, numbering
 * squares the standard way: left to right, top to bottom, a number on every
 * square that starts an Across or Down answer.
 */
export function buildPuzzle(puzzle) {
  const rows = puzzle.grid.length;
  const cols = Math.max(...puzzle.grid.map((row) => row.length));
  const isOpen = (r, c) =>
    r >= 0 && r < rows && c >= 0 && c < cols && /[A-Z]/.test(puzzle.grid[r][c] ?? '');

  const cells = [];
  const across = [];
  const down = [];
  const cellEntries = {};
  let number = 0;

  const addEntry = (list, dir, r, c, n, dr, dc) => {
    const entryCells = [];
    let answer = '';
    for (let rr = r, cc = c; isOpen(rr, cc); rr += dr, cc += dc) {
      entryCells.push([rr, cc]);
      answer += puzzle.grid[rr][cc];
    }
    const clue = puzzle.clues[answer];
    if (!clue) throw new Error(`Crossword "${puzzle.id}" has no clue for ${answer}`);
    const id = `${n}-${dir}`;
    list.push({ id, number: n, dir, answer, cells: entryCells, emoji: clue[0], clue: clue[1] });
    for (const [rr, cc] of entryCells) {
      const k = cellKey(rr, cc);
      cellEntries[k] = { ...cellEntries[k], [dir]: id };
    }
  };

  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      if (!isOpen(r, c)) {
        row.push(null);
        continue;
      }
      const startsAcross = !isOpen(r, c - 1) && isOpen(r, c + 1);
      const startsDown = !isOpen(r - 1, c) && isOpen(r + 1, c);
      const n = startsAcross || startsDown ? ++number : null;
      if (startsAcross) addEntry(across, 'across', r, c, n, 0, 1);
      if (startsDown) addEntry(down, 'down', r, c, n, 1, 0);
      row.push({ answer: puzzle.grid[r][c], number: n });
    }
    cells.push(row);
  }

  const entries = [...across, ...down];
  const entryById = Object.fromEntries(entries.map((e) => [e.id, e]));

  return { ...puzzle, rows, cols, cells, across, down, entries, entryById, cellEntries };
}
