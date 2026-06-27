import test from "node:test";
import assert from "node:assert/strict";
import { parseCsv, parseImportedText, parseTsv } from "./parser";
import { createDraft } from "./draft";
import { validateDrafts } from "./validator";

test("TSVを問題・答え・解説・タグへ展開する", () => {
  const rows = parseTsv("首都は？\t東京\t日本の首都\t地理,日本\n1+1\t2\t\t数学");
  assert.equal(rows.length, 2);
  assert.deepEqual({ front: rows[0].front, back: rows[0].back, explanation: rows[0].explanation, tags: rows[0].tags }, { front: "首都は？", back: "東京", explanation: "日本の首都", tags: "地理,日本" });
});

test("CSVを問題・答え・解説・タグへ展開する", () => {
  const rows = parseCsv('問題文,答え,解説,タグ\n"首都は？","東京","日本の首都","地理,日本"\n"1+1","2","","数学"');
  assert.equal(rows.length, 2);
  assert.deepEqual({ front: rows[0].front, back: rows[0].back, explanation: rows[0].explanation, tags: rows[0].tags }, { front: "首都は？", back: "東京", explanation: "日本の首都", tags: "地理,日本" });
});

test("貼り付け文字列からTSVとCSVを自動判定する", () => {
  assert.equal(parseImportedText("問題\t答え\nA\tB").length, 1);
  assert.equal(parseImportedText("問題,答え\nA,B").length, 1);
});

test("空行を除外し、問題文と答えの不足を検出する", () => {
  const result = validateDrafts([createDraft(), createDraft({ front: "問題のみ" }), createDraft({ front: "問題", back: "答え" })]);
  assert.equal(result.rows.length, 2);
  assert.equal(result.valid, false);
  assert.equal(result.errors[0].fields.back, "答えを入力してください");
});
