/** Utilidades puras para los juegos (fáciles de probar). */

export type QuizItem = { cca3: string; name: string; capital?: string; flag: string; region: string };

/** Mezcla Fisher–Yates con un generador inyectable (para tests). */
export function shuffle<T>(items: T[], random: () => number = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Crea una pregunta: la respuesta correcta y 3 distractores distintos (sin respuestas repetidas). */
export function buildQuestion(
  pool: QuizItem[],
  getAnswer: (item: QuizItem) => string | undefined,
  random: () => number = Math.random,
): { item: QuizItem; options: string[]; answer: string } | null {
  const valid = pool.filter((p) => getAnswer(p));
  if (valid.length < 4) return null;
  const item = valid[Math.floor(random() * valid.length)];
  const answer = getAnswer(item)!;
  const distractors: string[] = [];
  for (const candidate of shuffle(valid, random)) {
    const value = getAnswer(candidate)!;
    if (value !== answer && !distractors.includes(value)) distractors.push(value);
    if (distractors.length === 3) break;
  }
  if (distractors.length < 3) return null;
  return { item, answer, options: shuffle([answer, ...distractors], random) };
}
