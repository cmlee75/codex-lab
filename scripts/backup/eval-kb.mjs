import { readFile } from "node:fs/promises";
import sqlite3InitModule from "@sqlite.org/sqlite-wasm";
import { buildQuery, extractiveAnswer, search } from "../js/rag.js";

const loadDatabase = (sqlite3, data) => {
  const db = new sqlite3.oo1.DB();
  const pointer = sqlite3.wasm.allocFromTypedArray(data);
  const result = sqlite3.capi.sqlite3_deserialize(
    db,
    "main",
    pointer,
    data.byteLength,
    data.byteLength,
    sqlite3.capi.SQLITE_DESERIALIZE_FREEONCLOSE
  );
  if (result !== sqlite3.capi.SQLITE_OK) throw new Error(`Could not load academy.db (${result}).`);
  return db;
};

const cases = [
  ["refunds", "Refunds and cancellations"],
  ["nut allergy macaron", "Allergens and what to bring"],
  ["Bukit Timah parking", "Is there parking?"]
];

const sqlite3 = await sqlite3InitModule();
const db = loadDatabase(sqlite3, new Uint8Array(await readFile("data/academy.db")));
try {
  for (const [question, expectedSection] of cases) {
    const query = buildQuery(question);
    if (!query || !query.split(" OR ").every((term) => /^"[^\"]+"$/.test(term))) {
      throw new Error(`Unsafe query construction for: ${question}`);
    }
    const hits = search(db, question, 3);
    if (!hits[0] || hits[0].section !== expectedSection || !extractiveAnswer(hits)) {
      throw new Error(`Unexpected top result for ${question}`);
    }
    console.log(`${JSON.stringify(question)} -> ${hits[0].title} / ${hits[0].section}`);
  }
} finally {
  db.close();
}
