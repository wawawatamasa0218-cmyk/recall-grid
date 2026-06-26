import test from "node:test";
import assert from "node:assert/strict";
import { buildReviewQuestions } from "./randomizer";
import { scheduleReview } from "./scheduler";
import type { ReviewCard } from "./types";

const baseCard: ReviewCard = { id: "1", front: "Q", back: "A", explanation: "", tags: [], deckName: "D", nextReviewAt: "2026-01-01", stability: 0, difficulty: 5, reps: 0, lapses: 0 };

test("正解1つと誤答4つを重複なく生成する", () => {
  const questions = buildReviewQuestions([baseCard], ["A", "B", "C", "D", "E", "F"], () => 0.42);
  assert.equal(questions[0].choices.length, 5);
  assert.equal(new Set(questions[0].choices).size, 5);
  assert.ok(questions[0].choices.includes("A"));
});

test("正解は3日後、不正解は10分後に設定する", () => {
  const now = new Date("2026-06-22T00:00:00.000Z");
  const state = { stability: 0, difficulty: 5, reps: 2, lapses: 1 };
  const good = scheduleReview("good", state, now);
  const again = scheduleReview("again", state, now);
  assert.equal(good.nextReviewAt.getUTCDate(), 25);
  assert.equal(again.nextReviewAt.getTime() - now.getTime(), 10 * 60 * 1000);
  assert.equal(again.state.lapses, 2);
});
