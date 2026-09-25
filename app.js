const imageUrl = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=70`;
const signupStorageKey = "cb_signups";
const state = { courses: [], category: "All", query: "", selectedCourse: null };

const courseGrid = document.querySelector("#course-grid");
const campusGrid = document.querySelector("#campus-grid");
const resultsCount = document.querySelector("#course-results");
const searchInput = document.querySelector("#course-search");
const filterButtons = [...document.querySelectorAll(".filter-chip")];
const signupDialog = document.querySelector("#signup-dialog");
const signupForm = document.querySelector("#signup-form");
const signupCourse = document.querySelector("#signup-course");
const intakeSelect = document.querySelector("#intake");
const allergyWarning = document.querySelector("#allergy-warning");
const formMessage = document.querySelector("#form-message");
const signupSuccess = document.querySelector("#signup-success");

function createDetail(label, value, className = "") {
  const fragment = document.createDocumentFragment();
  const term = document.createElement("dt");
  const description = document.createElement("dd");
  term.textContent = label;
  description.textContent = value;
  if (className) { term.classList.add(className); description.classList.add(className); }
  fragment.append(term, description);
  return fragment;
}

function createCourseCard(course) {
  const article = document.createElement("article");
  const image = document.createElement("img");
  const body = document.createElement("div");
  const metadata = document.createElement("div");
  const heading = document.createElement("h3");
  const summary = document.createElement("p");
  const details = document.createElement("dl");
  const button = document.createElement("button");
  article.className = "course-card"; article.id = `course-${course.code}`;
  image.src = imageUrl(course.img); image.alt = `${course.title} course`; image.loading = "lazy"; image.width = 900; image.height = 563;
  body.className = "course-card-body"; metadata.className = "course-meta";
  [course.code, course.level, course.campus].forEach((item) => { const value = document.createElement("span"); value.textContent = item; metadata.append(value); });
  heading.textContent = course.title; summary.className = "course-summary"; summary.textContent = course.summary;
  details.className = "course-details";
  details.append(createDetail("Length", `${course.weeks} ${course.weeks === 1 ? "week" : "weeks"}`), createDetail("Fee", new Intl.NumberFormat("en-SG", { style: "currency", currency: "SGD", minimumFractionDigits: 0 }).format(course.fee)), createDetail("Schedule", course.when, "schedule"));
  button.type = "button"; button.className = "button button-primary signup-button"; button.textContent = "Sign up";
  button.addEventListener("click", () => openSignup(course));
  body.append(metadata, heading, summary, details, button); article.append(image, body);
  return article;
}

function getFilteredCourses() {
  const query = state.query.trim().toLowerCase();
  return state.courses.filter((course) => {
    const matchesCategory = state.category === "All" || course.cat === state.category;
    const searchableText = [course.code, course.title, course.cat, course.level, course.campus, course.summary, course.when, course.weeks].join(" ").toLowerCase();
    return matchesCategory && (!query || searchableText.includes(query));
  });
}
function renderCourses() {
  const visibleCourses = getFilteredCourses(); courseGrid.replaceChildren(); visibleCourses.forEach((course) => courseGrid.append(createCourseCard(course)));
  if (!visibleCourses.length) { const emptyState = document.createElement("p"); emptyState.className = "empty-state"; emptyState.textContent = "No courses match that search. Try another word or category."; courseGrid.append(emptyState); }
  resultsCount.textContent = `${visibleCourses.length} ${visibleCourses.length === 1 ? "course" : "courses"} found`;
}
function renderCampuses() {
  const campuses = [...new Set(state.courses.map((course) => course.campus))]; campusGrid.replaceChildren();
  campuses.forEach((campus) => { const campusCourses = state.courses.filter((course) => course.campus === campus); const categories = [...new Set(campusCourses.map((course) => course.cat))].join(" and "); const card = document.createElement("article"); const heading = document.createElement("h3"); const description = document.createElement("p"); const count = document.createElement("p"); card.className = "campus-card"; heading.textContent = campus; description.textContent = `${categories} courses`; count.className = "campus-count"; count.textContent = `${campusCourses.length} courses in the catalogue`; card.append(heading, description, count); campusGrid.append(card); });
}
function setCategory(category) { state.category = category; filterButtons.forEach((button) => { const active = button.dataset.category === category; button.classList.toggle("is-active", active); button.setAttribute("aria-pressed", String(active)); }); renderCourses(); }
filterButtons.forEach((button) => button.addEventListener("click", () => setCategory(button.dataset.category)));
searchInput.addEventListener("input", (event) => { state.query = event.target.value; renderCourses(); });

function currency(value) { return new Intl.NumberFormat("en-SG", { style: "currency", currency: "SGD", minimumFractionDigits: 0 }).format(value); }
function courseLabel(course) { return `${course.code} — ${course.title} | ${currency(course.fee)} | ${course.weeks} ${course.weeks === 1 ? "week" : "weeks"} | ${course.when} | ${course.campus}`; }
function clearErrors() { signupForm.querySelectorAll("[aria-invalid]").forEach((field) => field.removeAttribute("aria-invalid")); signupForm.querySelectorAll(".field-error").forEach((error) => { error.textContent = ""; }); formMessage.textContent = ""; }
function showError(field, message) { field.setAttribute("aria-invalid", "true"); const error = document.querySelector(`#${field.id}-error`); if (error) error.textContent = message; if (!formMessage.textContent) { formMessage.textContent = message; field.focus(); } }
function updateAllergyWarning() { const courseUsesNuts = state.selectedCourse?.allergens.toLowerCase().includes("nut"); const mentionsNuts = /\bnuts?\b/i.test(document.querySelector("#allergies").value); allergyWarning.hidden = !(courseUsesNuts && mentionsNuts); }
function openSignup(course) {
  state.selectedCourse = course; signupForm.reset(); clearErrors(); signupSuccess.hidden = true; signupForm.hidden = false;
  signupCourse.value = courseLabel(course); intakeSelect.replaceChildren();
  course.intakes.forEach((intake) => { const option = document.createElement("option"); option.value = intake; option.textContent = new Intl.DateTimeFormat("en-SG", { dateStyle: "long" }).format(new Date(`${intake}T00:00:00`)); intakeSelect.append(option); });
  allergyWarning.hidden = true; signupDialog.showModal();
}
function closeSignup() { signupDialog.close(); }
document.querySelector("#signup-close").addEventListener("click", closeSignup);
signupDialog.addEventListener("click", (event) => { if (event.target === signupDialog) closeSignup(); });
document.querySelector("#allergies").addEventListener("input", updateAllergyWarning);

function getSignups() { try { const saved = JSON.parse(localStorage.getItem(signupStorageKey) || "[]"); return Array.isArray(saved) ? saved : []; } catch { return []; } }
function makeReference(signups) { const day = new Date().toISOString().slice(0, 10).replaceAll("-", ""); const count = signups.filter((signup) => signup.reference?.startsWith(`CB-${day}-`)).length + 1; return `CB-${day}-${String(count).padStart(4, "0")}`; }
function mailtoFor(signup) { const body = [`Reference: ${signup.reference}`, `Course: ${signup.course_code} — ${signup.course_title}`, `Intake: ${signup.intake}`, `Name: ${signup.full_name}`, `Email: ${signup.email}`, `Mobile: ${signup.mobile}`, `Experience: ${signup.experience}`, `Allergies: ${signup.allergies || "None"}`].join("\n"); return `mailto:enrol@cookbakeacademy.sg?subject=${encodeURIComponent(`Course sign-up ${signup.reference}`)}&body=${encodeURIComponent(body)}`; }

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault(); clearErrors();
  const fields = { name: document.querySelector("#full-name"), email: document.querySelector("#email"), mobile: document.querySelector("#mobile"), consent: document.querySelector("#consent") };
  const name = fields.name.value.trim(); const email = fields.email.value.trim(); const mobile = fields.mobile.value.trim();
  if (name.length < 2) showError(fields.name, "Enter your full name (at least 2 characters).");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) showError(fields.email, "Enter a valid email address.");
  if (!/^(?:\+65\s?)?[689]\d{3}\s?\d{4}$/.test(mobile)) showError(fields.mobile, "Enter a Singapore mobile number, for example +65 9123 4567.");
  if (!fields.consent.checked) showError(fields.consent, "You must agree to be contacted about this sign-up.");
  if (formMessage.textContent) return;
  const signups = getSignups(); const course = state.selectedCourse;
  const signup = { reference: makeReference(signups), submitted_at: new Date().toISOString(), course_code: course.code, course_title: course.title, course_fee: course.fee, course_weeks: course.weeks, course_schedule: course.when, course_campus: course.campus, intake: intakeSelect.value, full_name: name, email, mobile, experience: document.querySelector("#experience").value, allergies: document.querySelector("#allergies").value.trim(), consent: true, newsletter: document.querySelector("#newsletter").checked };
  signups.push(signup); localStorage.setItem(signupStorageKey, JSON.stringify(signups));
  if (window.SIGNUP_ENDPOINT) { try { await fetch(window.SIGNUP_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(signup) }); } catch (error) { console.warn("Optional sign-up endpoint did not accept the submission", error); } }
  signupForm.hidden = true; signupSuccess.hidden = false; document.querySelector("#signup-reference").textContent = signup.reference; const mailto = document.querySelector("#signup-mailto"); mailto.href = mailtoFor(signup);
});

async function loadCourses() {
  try { const response = await fetch("data/courses.json"); if (!response.ok) throw new Error(`Could not load courses (${response.status})`); const courses = await response.json(); if (!Array.isArray(courses)) throw new Error("Course data is not an array"); state.courses = courses; renderCourses(); renderCampuses(); }
  catch (error) { courseGrid.replaceChildren(); const errorMessage = document.createElement("p"); errorMessage.className = "empty-state"; errorMessage.textContent = "Courses could not be loaded. Please refresh the page or contact us for help."; courseGrid.append(errorMessage); resultsCount.textContent = "Courses are unavailable right now"; console.error(error); }
  finally { courseGrid.setAttribute("aria-busy", "false"); }
}
loadCourses();
