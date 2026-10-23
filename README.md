# LearningFunGame

Princess Learning Fun — games to make learning fun! 👑✨

A girl-themed (pinks, purples, princesses, unicorns, rainbows, cute cats)
learning app for young kids, designed for iPhone and iPad with big, icon-based
buttons that don't require reading.

## Game modes

Pick a game from the welcome screen:

- **🦄 Words** — reading flashcards: read a single word, tap the card to flip
  it for a picture + sound hint
- **👸 Sentences** — read a whole short sentence at once, with a picture-clue
  hint button that shows what the sentence means
- **🌈 Counting** — start at a random number between 1 and 99 and count up by
  tapping the number that comes next
- **😺 Math** — basic addition and subtraction (all numbers below 30) with
  emoji counters to help count
- **🧩 Crossword** — kid-sized crossword puzzles (about 5 Across and 5 Down
  clues each) with picture clues and simple kindergarten / first-grade words.
  Type with the big ABC keyboard (vowels in pink), tap a square twice to switch
  between Across and Down, and use 💡 for a letter hint. Every solved answer
  bursts into stars, and every finished puzzle ends with a rainbow, unicorn, or
  princess celebration. Puzzles live in `src/data/crosswords.js`.

All games award gold stars, with mini celebrations along the way and a big
animated "Treat Time" reward roughly every few minutes of play.

## Development

```bash
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
```
