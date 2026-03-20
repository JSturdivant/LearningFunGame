const VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U']);

const DIGRAPHS = [
  'ch', 'sh', 'th', 'wh', 'ph', 'ck', 'ng', 'qu',
  'bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr',
  'pl', 'pr', 'sc', 'sk', 'sl', 'sm', 'sn', 'sp', 'st', 'sw', 'tr', 'tw',
];

const SILENT_RULES = {
  e: (word, i) => i === word.length - 1 && i > 1,
  k: (word, i) => i === 0 && word[1]?.toLowerCase() === 'n',
  w: (word, i) => i === 0 && word[1]?.toLowerCase() === 'r',
  b: (word, i) => i === word.length - 1 && word[i - 1]?.toLowerCase() === 'm',
  g: (word, i) => word[i - 1]?.toLowerCase() === 'n',
};

/**
 * Classifies each letter of a word into a phonetic category.
 * Returns an array of { ch, type } objects where type is one of:
 * 'vowel' | 'consonant' | 'silent' | 'digraph' | 'punct'
 */
export function classifyLetters(word) {
  const clean = word.replace(/[^a-zA-Z]/g, '');
  const lc = clean.toLowerCase();
  const result = [];
  let i = 0;

  while (i < clean.length) {
    // Check for digraph
    if (i + 1 < clean.length) {
      const di = lc[i] + lc[i + 1];
      if (DIGRAPHS.includes(di)) {
        result.push({ ch: clean[i] + clean[i + 1], type: 'digraph' });
        i += 2;
        continue;
      }
    }

    // Check for silent letter
    const rule = SILENT_RULES[lc[i]];
    if (rule && rule(lc, i)) {
      result.push({ ch: clean[i], type: 'silent' });
      i++;
      continue;
    }

    // Vowel or consonant
    result.push({ ch: clean[i], type: VOWELS.has(clean[i]) ? 'vowel' : 'consonant' });
    i++;
  }

  // Append any trailing punctuation
  const trailPunct = word.slice(clean.length);
  for (const p of trailPunct) {
    result.push({ ch: p, type: 'punct' });
  }

  return result;
}
