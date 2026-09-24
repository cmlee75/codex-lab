const storageKey = "cb_signups";
const columns = ["reference", "submitted_at", "course_code", "course_title", "course_fee", "course_weeks", "course_schedule", "course_campus", "intake", "full_name", "email", "mobile", "experience", "allergies", "consent", "newsletter"];
function getSignups() { try { const records = JSON.parse(localStorage.getItem(storageKey) || "[]"); return Array.isArray(records) ? records : []; } catch { return []; } }
function csvValue(value) { return `"${String(value ?? "").replaceAll('"', '""')}"`; }
function render() {
  const signups = getSignups(); const head = document.querySelector("#signup-head"); const list = document.querySelector("#signup-list");
  head.replaceChildren(); list.replaceChildren(); const row = document.createElement("tr"); columns.forEach((column) => { const cell = document.createElement("th"); cell.scope = "col"; cell.textContent = column; row.append(cell); }); head.append(row);
  if (!signups.length) { const empty = document.createElement("tr"); const cell = document.createElement("td"); cell.colSpan = columns.length; cell.className = "admin-empty"; cell.textContent = "No sign-ups are stored on this device."; empty.append(cell); list.append(empty); }
  signups.forEach((signup) => { const row = document.createElement("tr"); columns.forEach((column) => { const cell = document.createElement("td"); cell.textContent = String(signup[column] ?? ""); row.append(cell); }); list.append(row); });
  document.querySelector("#signup-count").textContent = `${signups.length} ${signups.length === 1 ? "sign-up" : "sign-ups"} stored`;
}
document.querySelector("#export-csv").addEventListener("click", () => { const data = [columns.join(","), ...getSignups().map((signup) => columns.map((column) => csvValue(signup[column])).join(","))].join("\r\n"); const url = URL.createObjectURL(new Blob([data], { type: "text/csv;charset=utf-8" })); const link = document.createElement("a"); link.href = url; link.download = "cook-bake-signups.csv"; link.click(); URL.revokeObjectURL(url); });
render();