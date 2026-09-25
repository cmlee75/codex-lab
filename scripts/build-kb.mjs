import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sqlite3InitModule from "@sqlite.org/sqlite-wasm";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const kbDir = path.join(rootDir, "kb");
const coursesPath = path.join(rootDir, "data", "courses.json");
const outputPath = path.join(rootDir, "data", "academy.db");

const listMarkdownFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listMarkdownFiles(entryPath);
    return entry.isFile() && entry.name.endsWith(".md") ? [entryPath] : [];
  }));
  return files.flat();
};

const markdownChunks = (source, filePath) => {
  const normalized = source.replace(/\r\n/g, "\n");
  const title = normalized.match(/^#\s+(.+)$/m)?.[1].trim() ?? path.basename(filePath, ".md");
  const sections = [...normalized.matchAll(/^##\s+(.+)\n/gm)];
  const docId = path.relative(rootDir, filePath).replaceAll("\\", "/");

  return sections.map((section, index) => ({
    docId,
    title,
    section: section[1].trim(),
    body: normalized.slice(section.index + section[0].length, sections[index + 1]?.index).trim(),
    url: `/${docId}`
  }));
};

const insertRows = (db, sql, rows) => {
  const statement = db.prepare(sql);
  try {
    for (const row of rows) statement.bind(row).stepReset();
  } finally {
    statement.finalize();
  }
};

const topHit = (db, query) => db.selectObject(
  `SELECT doc_id, title, section, url
     FROM chunks
    WHERE chunks MATCH ?
    ORDER BY bm25(chunks, 8.0, 3.0, 1.0)
    LIMIT 1`,
  [query]
);

const main = async () => {
  const [markdownFiles, courses] = await Promise.all([
    listMarkdownFiles(kbDir),
    readFile(coursesPath, "utf8").then(JSON.parse)
  ]);
  const chunks = (await Promise.all(markdownFiles.map(async (filePath) => (
    markdownChunks(await readFile(filePath, "utf8"), filePath)
  )))).flat();

  const sqlite3 = await sqlite3InitModule();
  const db = new sqlite3.oo1.DB();
  try {
    db.exec(`
      CREATE VIRTUAL TABLE chunks USING fts5(
        doc_id UNINDEXED,
        title,
        section,
        body,
        url UNINDEXED,
        tokenize = 'porter unicode61'
      );
      CREATE TABLE courses (
        code TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        level TEXT NOT NULL,
        weeks INTEGER NOT NULL,
        fee INTEGER NOT NULL,
        campus TEXT NOT NULL,
        image_id TEXT NOT NULL,
        schedule TEXT NOT NULL,
        summary TEXT NOT NULL,
        learn TEXT NOT NULL,
        allergens TEXT NOT NULL,
        bring TEXT NOT NULL,
        intakes TEXT NOT NULL,
        class_size INTEGER NOT NULL
      );
    `);

    insertRows(
      db,
      "INSERT INTO chunks (doc_id, title, section, body, url) VALUES (?, ?, ?, ?, ?)",
      chunks.map(({ docId, title, section, body, url }) => [docId, title, section, body, url])
    );
    insertRows(
      db,
      `INSERT INTO courses (
        code, title, category, level, weeks, fee, campus, image_id, schedule,
        summary, learn, allergens, bring, intakes, class_size
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      courses.map((course) => [
        course.code,
        course.title,
        course.cat,
        course.level,
        course.weeks,
        course.fee,
        course.campus,
        course.img,
        course.when,
        course.summary,
        JSON.stringify(course.learn),
        course.allergens,
        course.bring,
        JSON.stringify(course.intakes),
        course.class_size
      ])
    );

    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, sqlite3.capi.sqlite3_js_db_export(db));

    console.log(`Built data/academy.db with ${chunks.length} knowledge-base chunks and ${courses.length} courses.`);
    for (const query of ["refunds", "nut allergy macaron", "Bukit Timah parking"]) {
      const hit = topHit(db, query);
      if (!hit) throw new Error(`No FTS hit for query: ${query}`);
      console.log(`${JSON.stringify(query)} -> ${hit.title} / ${hit.section} (${hit.url})`);
    }
  } finally {
    db.close();
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
