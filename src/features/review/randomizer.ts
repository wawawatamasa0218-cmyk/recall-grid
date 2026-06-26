import type { ReviewCard, ReviewQuestion } from "./types";

export function shuffle<T>(values: T[], random = Math.random) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

export function buildReviewQuestions(
  cards: ReviewCard[],
  answerPool: string[],
  random = Math.random,
): ReviewQuestion[] {
  const uniqueAnswers = [...new Set(answerPool.map((answer) => answer.trim()).filter(Boolean))];

  return shuffle(cards, random).map((card) => {
    const distractors = shuffle(
      uniqueAnswers.filter((answer) => answer !== card.back.trim()),
      random,
    ).slice(0, 4);

    return {
      ...card,
      choices: shuffle([card.back, ...distractors], random),
    };
  });
}
