const stopwords = new Set([
  "a", "an", "and", "are", "at", "can", "do", "for", "from", "i", "in", "is",
  "it", "me", "my", "of", "on", "or", "the", "to", "we", "what", "which", "with", "you"
]);

const offTopicPattern = /\b(weather|restaurant|python|system prompt|you are now the admin)\b/i;
const courseIntentPattern = /\b(course|class|baking|cooking|fee|price|discount|refund|campus|allerg|nut|gluten|dairy|egg|schedule|intake|parking|apron|skillsfuture|corporate|miss|knife|chocolate|bread|sushi|vegan|pay|macaron|cake|bbq)\b/i;

const sourceId = (docId) => {
  const brochure = String(docId).match(/^kb\/brochures\/([A-Z]+-\d+)\.md$/);
  if (brochure) return brochure[1];
  return String(docId).replace(/^kb\//, "").replace(/\.md$/, "");
};

const isOffTopic = (text) => offTopicPattern.test(text) && !courseIntentPattern.test(text);

const sourceUrl = (docId) => {
  const id = sourceId(docId);
  if (/^[A-Z]+-\d+$/.test(id)) return `#course-${id}`;
  return id === "campuses" ? "#campuses" : "#faq";
};

export const buildQuery = (text) => {
  const normalized = String(text || "").toLowerCase();
  const terms = normalized.match(/[\p{L}\p{N}]+/gu)?.filter((term) => !stopwords.has(term)) ?? [];
  const expanded = [...terms];

  if (/\bhow\s+long\b/.test(normalized)) expanded.push("duration");
  if (/\bwhen\b|\bstart(?:s|ing)?\b/.test(normalized)) expanded.push("intakes");
  if (/\bhow\s+much\b/.test(normalized)) expanded.push("fee");
  if (/\bwhere\b/.test(normalized)) expanded.push("address");
  if (/\b(allerg(?:y|ies|en)|nut(?:s)?|gluten|dairy|egg(?:s)?|shellfish)\b/.test(normalized)) expanded.push("allergens");

  return [...new Set(expanded)].map((term) => `"${term.replaceAll("\"", "\"\"")}"`).join(" OR ");
};

export const search = (db, text, k = 3) => {
  if (isOffTopic(String(text || ""))) return [];
  const query = buildQuery(text);
  if (!query) return [];

  const rows = db.selectObjects(
    `SELECT doc_id, title, section, body, url
       FROM chunks
      WHERE chunks MATCH ?
      ORDER BY bm25(chunks, 0, 6, 3, 1, 0)
      LIMIT ?`,
    [query, Math.max(1, Math.floor(k))]
  );
  return rows.map((row) => ({ ...row, doc_id: sourceId(row.doc_id), url: sourceUrl(row.doc_id) }));
};

export const extractiveAnswer = (hits) => hits[0]?.body ?? null;

export const structuredAnswer = (db, text) => {
  const normalized = String(text || "").toLowerCase();
  let courses = [];
  let textAnswer = "";

  if (/\b(cheapest|least expensive|lowest fee)\b/.test(normalized)) {
    courses = db.selectObjects("SELECT code, title, fee FROM courses ORDER BY fee ASC, title ASC LIMIT 1");
    if (courses[0]) textAnswer = `The cheapest course is ${courses[0].title} at S$${courses[0].fee}.`;
  } else if (/\b(most expensive|highest fee)\b/.test(normalized)) {
    courses = db.selectObjects("SELECT code, title, fee FROM courses ORDER BY fee DESC, title ASC LIMIT 1");
    if (courses[0]) textAnswer = `The most expensive course is ${courses[0].title} at S$${courses[0].fee}.`;
  } else {
    const under = normalized.match(/\bunder\s+(?:s\$?\s*)?(\d+)\b/);
    if (under) {
      courses = db.selectObjects(
        "SELECT code, title, fee FROM courses WHERE fee < ? ORDER BY fee ASC, title ASC LIMIT 3",
        [Number(under[1])]
      );
      textAnswer = courses.length
        ? `Courses under S$${under[1]}: ${courses.map((course) => `${course.title} (S$${course.fee})`).join(", ")}.`
        : `There are no courses under S$${under[1]}.`;
    }
  }

  if (!textAnswer) return null;
  return {
    text: textAnswer,
    hits: courses.map((course) => ({
      doc_id: course.code,
      title: course.title,
      section: "Course details",
      body: `Course fee: S$${course.fee}`,
      url: `#course-${course.code}`
    }))
  };
};
