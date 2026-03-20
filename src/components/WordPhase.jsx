import ProgressDots from './ProgressDots';
import FlipCard from './FlipCard';

export default function WordPhase({ sentence, wordIdx, flipped, onFlip }) {
  return (
    <>
      <ProgressDots words={sentence.words} currentIdx={wordIdx} />
      <FlipCard
        word={sentence.words[wordIdx]}
        hint={sentence.hints[wordIdx]}
        flipped={flipped}
        onFlip={onFlip}
      />
    </>
  );
}
