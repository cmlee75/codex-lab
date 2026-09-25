import sqlite3InitModule from "https://cdn.jsdelivr.net/npm/@sqlite.org/sqlite-wasm@3.53.4-build1/dist/index.mjs";
import { extractiveAnswer, search, structuredAnswer } from "./rag.js";

const apiKeyStorageKey = "cook-bake-openai-api-key";
const assistantDialog = document.querySelector("#assistant-dialog");
const assistantOpenButtons = document.querySelectorAll("[data-assistant-open]");
const assistantCloseButton = document.querySelector("#assistant-close");
const assistantSettingsToggle = document.querySelector("#assistant-settings-toggle");
const assistantSettings = document.querySelector("#assistant-settings");
const assistantSettingsForm = document.querySelector("#assistant-settings-form");
const assistantApiKey = document.querySelector("#assistant-api-key");
const assistantModel = document.querySelector("#assistant-model");
const assistantSettingsStatus = document.querySelector("#assistant-settings-status");
const assistantForm = document.querySelector("#assistant-form");
const assistantInput = document.querySelector("#assistant-question");
const assistantStatus = document.querySelector("#assistant-status");
const assistantResponse = document.querySelector("#assistant-response");

let databasePromise;
let groundedPromptPromise;

const readApiKey = () => {
  try {
    return sessionStorage.getItem(apiKeyStorageKey)?.trim() ?? "";
  } catch {
    return "";
  }
};

const sourceHref = (hit) => hit.url?.startsWith("#") ? hit.url : "#faq";

const deserializeDatabase = (sqlite3, data) => {
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
  if (result !== sqlite3.capi.SQLITE_OK) {
    sqlite3.wasm.dealloc(pointer);
    db.close();
    throw new Error(`Could not load the course database (${result}).`);
  }
  return db;
};

const loadDatabase = () => {
  if (!databasePromise) {
    databasePromise = Promise.all([
      sqlite3InitModule(),
      fetch("data/academy.db").then((response) => {
        if (!response.ok) throw new Error(`Could not load the course database (${response.status}).`);
        return response.arrayBuffer();
      })
    ]).then(([sqlite3, buffer]) => deserializeDatabase(sqlite3, new Uint8Array(buffer)));
  }
  return databasePromise;
};

const loadGroundedPrompt = () => {
  if (!groundedPromptPromise) {
    groundedPromptPromise = fetch("grounded-prompt.md")
      .then((response) => {
        if (!response.ok) throw new Error(`Could not load grounded instructions (${response.status}).`);
        return response.text();
      })
      .then((markdown) => {
        const instructions = markdown.match(/^> (.+)$/gm)?.map((line) => line.slice(2)).join("\n");
        if (!instructions) throw new Error("Grounded instructions are missing.");
        return instructions;
      });
  }
  return groundedPromptPromise;
};

const addText = (parent, tagName, text, className = "") => {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = text;
  parent.append(element);
  return element;
};

const renderSources = (hits) => {
  const sources = document.createElement("section");
  const heading = document.createElement("h3");
  const list = document.createElement("ul");
  heading.textContent = "Sources";
  sources.className = "assistant-sources";

  hits.slice(0, 3).forEach((hit, index) => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = sourceHref(hit);
    link.textContent = `[${index + 1}] ${hit.title} — ${hit.section || "Course details"}`;
    item.append(link);
    list.append(item);
  });
  sources.append(heading, list);
  return sources;
};

const refusal = () => "I can only answer questions about Cook & Bake's courses, schedules, fees, campuses and policies. Please email hello@cookandbake.academy for anything else.";

const showAnswer = (answer, hits) => {
  assistantResponse.replaceChildren();
  addText(assistantResponse, "p", answer, "assistant-answer");
  if (hits.length) assistantResponse.append(renderSources(hits));
};

const sourcesInput = (hits, question) => [
  "Sources:",
  ...hits.slice(0, 3).map((hit, index) => `[${index + 1}] ${hit.title} — ${hit.section}\n${hit.body}`),
  "",
  `Question: ${question}`
].join("\n\n");

const responseText = (response) => {
  if (typeof response.output_text === "string" && response.output_text.trim()) return response.output_text.trim();
  return response.output
    ?.flatMap((item) => item.content ?? [])
    .filter((content) => content.type === "output_text")
    .map((content) => content.text)
    .join("\n")
    .trim() ?? "";
};

const askChatGPT = async (apiKey, model, hits, question) => {
  const [instructions] = await Promise.all([loadGroundedPrompt()]);
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      instructions,
      input: sourcesInput(hits, question),
      store: false
    })
  });
  if (!response.ok) throw new Error(`Responses API request failed (${response.status}).`);
  const answer = responseText(await response.json());
  if (!answer) throw new Error("Responses API returned no text.");
  return answer;
};

assistantApiKey.value = readApiKey();
assistantOpenButtons.forEach((button) => button.addEventListener("click", () => {
  assistantDialog.showModal();
  assistantInput.focus();
}));
assistantCloseButton.addEventListener("click", () => assistantDialog.close());
assistantSettingsToggle.addEventListener("click", () => {
  assistantSettings.hidden = !assistantSettings.hidden;
  assistantSettingsToggle.setAttribute("aria-expanded", String(!assistantSettings.hidden));
  if (!assistantSettings.hidden) assistantApiKey.focus();
});
assistantDialog.addEventListener("click", (event) => {
  if (event.target === assistantDialog) assistantDialog.close();
});

assistantSettingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const apiKey = assistantApiKey.value.trim();
  try {
    if (apiKey) {
      sessionStorage.setItem(apiKeyStorageKey, apiKey);
      assistantSettingsStatus.textContent = "ChatGPT mode is ready for this browser session.";
    } else {
      sessionStorage.removeItem(apiKeyStorageKey);
      assistantSettingsStatus.textContent = "ChatGPT mode is off until you add an API key.";
    }
  } catch {
    assistantSettingsStatus.textContent = "This browser could not save the key for the session.";
  }
});

assistantForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const question = assistantInput.value.trim();
  if (!question) return;

  assistantStatus.textContent = "Searching the course guide…";
  assistantResponse.replaceChildren();
  try {
    const db = await loadDatabase();
    const structured = structuredAnswer(db, question);
    if (structured) {
      showAnswer(structured.text, structured.hits);
      assistantStatus.textContent = "";
      return;
    }

    const hits = search(db, question, 3);
    if (!hits.length) {
      showAnswer(refusal(), []);
      assistantStatus.textContent = "No matching course information found.";
      return;
    }

    const apiKey = readApiKey();
    if (!apiKey) {
      showAnswer(extractiveAnswer(hits), hits);
      assistantStatus.textContent = "Search mode";
      return;
    }

    assistantStatus.textContent = "Asking ChatGPT with the course-guide sources…";
    try {
      const answer = await askChatGPT(apiKey, assistantModel.value.trim() || "gpt-6-luna", hits, question);
      showAnswer(answer, hits);
      assistantStatus.textContent = "ChatGPT mode";
    } catch {
      showAnswer(extractiveAnswer(hits), hits);
      assistantStatus.textContent = "ChatGPT mode was unavailable, so this is the course-guide result.";
    }
  } catch (error) {
    console.error(error);
    showAnswer("I could not load the course guide. Please email hello@cookandbake.academy for help.", []);
    assistantStatus.textContent = "The course guide is unavailable right now.";
  }
});
