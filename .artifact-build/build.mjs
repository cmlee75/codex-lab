import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outDir = "C:/Users/RSTN/Downloads/codex/lab/outputs/pricing-workbook";
await fs.mkdir(outDir, { recursive: true });

const courses = JSON.parse(await fs.readFile("C:/Users/RSTN/Downloads/codex/lab/data/courses.json", "utf8"));
const recipe = [
  ["BAK-101", "Artisan Sourdough Bread Baking", 4, 12.6, 4.48], ["BAK-102", "French Pastry & Viennoiserie", 8, 11.01, 5.77],
  ["BAK-103", "Wedding Cake Design & Decoration", 6, 14.86, 3.56], ["BAK-104", "Macaron Masterclass", 2, 12.73, 4.42],
  ["BAK-105", "Chocolate & Confectionery Making", 4, 32.78, 6.2], ["BAK-106", "Cupcake & Cake Pops Workshop", 1, 16.63, 7.28],
  ["BAK-107", "Bread Making Fundamentals", 3, 11.96, 3.05], ["BAK-108", "Cookie & Biscuit Baking", 1, 10.94, 5.03],
  ["BAK-109", "Pie & Tart Specialist", 3, 12.82, 4.37], ["BAK-110", "Korean & Asian Bakery", 4, 10.96, 6.85],
  ["CUL-201", "Italian Cuisine Mastery", 6, 27.35, 3.78], ["CUL-202", "Thai Street Food Cooking", 3, 16.18, 7.94],
  ["CUL-203", "Japanese Sushi & Sashimi", 4, 37.48, 5.61], ["CUL-204", "French Culinary Foundations", 8, 24.41, 4.15],
  ["CUL-205", "Chinese Wok Cooking", 3, 24.07, 3.86], ["CUL-206", "Indian Curry & Spices", 3, 19.57, 3.68],
  ["CUL-207", "Healthy Meal Prep & Nutrition", 2, 24.59, 4.61], ["CUL-208", "Vegetarian & Vegan Cuisine", 3, 15.94, 3.32],
  ["CUL-209", "Grilling & BBQ Mastery", 2, 21.77, 6.18], ["CUL-210", "Knife Skills & Kitchen Essentials", 1, 18.9, 3.28],
];
const instructors = [
  ["Chef Aurelie Martin", "Bakery", "BAK-102;BAK-109;BAK-103", 220], ["Chef Daniel Koh", "Bakery", "BAK-101;BAK-107;BAK-110", 220],
  ["Chef Mei Ling Tan", "Bakery", "BAK-104;BAK-105;BAK-106;BAK-108", 220], ["Chef Marco Rossi", "Cooking", "CUL-201;CUL-204", 240],
  ["Chef Siriporn Chai", "Cooking", "CUL-202;CUL-205", 240], ["Chef Kenji Watanabe", "Cooking", "CUL-203;CUL-209", 240],
  ["Chef Anjali Rao", "Cooking", "CUL-206;CUL-207;CUL-208;CUL-210", 240],
];
const fixedCosts = [
  ["Orchard Road Bakehouse rent", 14500, "monthly"], ["Bukit Timah Culinary Campus rent", 11800, "monthly"],
  ["Utilities (both campuses)", 3900, "monthly"], ["Equipment lease and maintenance", 2600, "monthly"],
  ["Insurance", 850, "monthly"], ["Software, website and payment fees", 640, "monthly"],
  ["Marketing budget", 3000, "monthly"], ["Administrator salary (1 FTE)", 4200, "monthly"],
  ["Kitchen assistant wages (part-time, per session)", 60, "per_session"],
];

const wb = Workbook.create();
const unit = wb.worksheets.add("Unit cost");
const fixed = wb.worksheets.add("Fixed costs");
const be = wb.worksheets.add("Break-even");
const fee = wb.worksheets.add("Fee check");
const notes = wb.worksheets.add("Notes");

const navy = "#274C5A";
const tan = "#F4EDE2";
const pale = "#F8F5F0";
const red = "#FCE4E4";
const green = "#E4F2E8";
const font = { name: "Arial", size: 10, color: "#24323A" };

function baseSheet(sheet, title, subtitle) {
  sheet.getRange("A1:Z100").format.font = font;
  sheet.getRange("A1").values = [[title]];
  sheet.getRange("A1").format.font = { name: "Arial", size: 15, bold: true, color: navy };
  sheet.getRange("A2").values = [[subtitle]];
  sheet.getRange("A2").format.font = { name: "Arial", size: 10, italic: true, color: "#63727A" };
}
function header(sheet, range) {
  sheet.getRange(range).format = { fill: navy, font: { name: "Arial", size: 10, bold: true, color: "#FFFFFF" }, horizontalAlignment: "center", verticalAlignment: "center" };
}
function money(sheet, range) { sheet.getRange(range).format.numberFormat = '"S$"#,##0.00;("S$"#,##0.00);-'; }

baseSheet(unit, "Unit cost", "Direct cost per seat at 8, 10 and 12 learners. Planning class size is 10.");
unit.getRange("A4:Q4").values = [["Code", "Course", "Category", "Current fee", "Sessions", "Ingredients / learner / session", "Consumables / learner", "Chef", "Chef rate / session", "Assistant / session", "Direct cost / seat @ 8", "Direct cost / seat @ 10", "Direct cost / seat @ 12", "Margin @ 10", "Target fee", "Fee status", "Source"]];
header(unit, "A4:Q4");
const unitRows = recipe.map((r, i) => {
  const c = courses.find(x => x.code === r[0]);
  const inst = instructors.find(x => x[2].split(";").includes(r[0]));
  return [r[0], r[1], c?.cat ?? "UNKNOWN", c?.fee ?? "UNKNOWN", r[2], r[3], r[4], inst?.[0] ?? "UNKNOWN", inst?.[3] ?? "UNKNOWN", 60, null, null, null, null, null, null, "Drive: recipe-costs.csv; courses.json; instructors.csv; fixed-costs.csv"];
});
unit.getRange(`A5:Q${4 + unitRows.length}`).values = unitRows;
for (let row = 5; row <= 4 + unitRows.length; row++) {
  unit.getRange(`K${row}:P${row}`).formulas = [[
    `=IF(OR(E${row}="UNKNOWN",F${row}="UNKNOWN",G${row}="UNKNOWN",I${row}="UNKNOWN",J${row}="UNKNOWN"),"UNKNOWN",F${row}*E${row}+G${row}+(I${row}+J${row})*E${row}/8)`,
    `=IF(OR(E${row}="UNKNOWN",F${row}="UNKNOWN",G${row}="UNKNOWN",I${row}="UNKNOWN",J${row}="UNKNOWN"),"UNKNOWN",F${row}*E${row}+G${row}+(I${row}+J${row})*E${row}/10)`,
    `=IF(OR(E${row}="UNKNOWN",F${row}="UNKNOWN",G${row}="UNKNOWN",I${row}="UNKNOWN",J${row}="UNKNOWN"),"UNKNOWN",F${row}*E${row}+G${row}+(I${row}+J${row})*E${row}/12)`,
    `=IF(OR(D${row}="UNKNOWN",L${row}="UNKNOWN"),"UNKNOWN",(D${row}-L${row})/D${row})`,
    `=IF(L${row}="UNKNOWN","UNKNOWN",L${row}/(1-45%))`,
    `=IF(OR(D${row}="UNKNOWN",O${row}="UNKNOWN"),"UNKNOWN",IF(D${row}<O${row},"UNDERPRICED","OK"))`,
  ]];
}
money(unit, "D5:D24"); money(unit, "F5:M24"); money(unit, "O5:O24"); unit.getRange("N5:N24").format.numberFormat = "0.0%";
unit.getRange("A4:Q24").format.verticalAlignment = "center";
unit.getRange("P5:P24").conditionalFormats.addCustom('=P5="UNDERPRICED"', { fill: red, font: { color: "#9B1C1C", bold: true } });

baseSheet(fixed, "Fixed costs", "Monthly fixed-cost total excludes the separately listed per-session assistant wage.");
fixed.getRange("A4:D4").values = [["Item", "Amount", "Basis", "Monthly treatment"]]; header(fixed, "A4:D4");
fixed.getRange("A5:C13").values = fixedCosts;
fixed.getRange("D5:D13").formulas = fixedCosts.map((_, i) => [`=IF(C${5+i}="monthly","Included in monthly fixed costs","Variable per session; excluded")`]);
fixed.getRange("A15:B18").values = [["Monthly fixed costs", null], ["Per-session assistant wage", null], ["Monthly assistant session volume", "UNKNOWN"], ["Monthly total including assistant wages", null]];
fixed.getRange("B15").formulas = [["=SUMIF(C5:C13,\"monthly\",B5:B13)"]];
fixed.getRange("B16").formulas = [["=SUMIF(C5:C13,\"per_session\",B5:B13)"]];
fixed.getRange("B18").formulas = [["=IF(B17=\"UNKNOWN\",\"UNKNOWN\",B15+B16*B17)"]];
header(fixed, "A15:A18"); money(fixed, "B5:B18");

baseSheet(be, "Break-even", "Seats per month needed for current fee mix to cover monthly fixed costs.");
be.getRange("A4:B12").values = [["Metric", "Value"], ["Monthly fixed costs", null], ["Average current fee across courses", null], ["Average direct cost / seat @ 10", null], ["Base contribution / seat", null], ["Base break-even seats / month", null], ["Discounted learner share", 0.2], ["Early-bird share of discounted learners", "UNKNOWN"], ["Discount-adjusted break-even seats / month", null]];
header(be, "A4:B4");
be.getRange("B5:B9").formulas = [["='Fixed costs'!B15"], ["=AVERAGE('Fee check'!C5:C24)"], ["=AVERAGE('Unit cost'!L5:L24)"], ["=B6-B7"], ["=IF(OR(B8=\"UNKNOWN\",B8<=0),\"UNKNOWN\",ROUNDUP(B5/B8,0))"]];
be.getRange("B12").formulas = [["=IF(B11=\"UNKNOWN\",\"UNKNOWN\",ROUNDUP(B5/(B8*(1-B10*(B11*10%+(1-B11)*5%))),0))"]];
be.getRange("A14:B16").values = [["Interpretation", "The base result uses current fees and direct cost at 10 learners."], ["Discount caveat", "The discount-adjusted result stays UNKNOWN until the mix of early-bird versus bring-a-friend users is supplied."], ["Source", "pricing-rules.md; fixed-costs.csv; courses.json; recipe-costs.csv"]];
money(be, "B5:B8"); be.getRange("B10").format.numberFormat = "0.0%"; be.getRange("B12").format.numberFormat = "#,##0"; be.getRange("B11").format.fill = tan;

baseSheet(fee, "Fee check", "Current course fee compared with the 45% gross-margin pricing rule.");
fee.getRange("A4:H4").values = [["Code", "Course", "Current fee", "Direct cost / seat @ 10", "Target fee", "Fee gap", "Status", "Rule"]]; header(fee, "A4:H4");
fee.getRange("A5:B24").formulas = Array.from({ length: 20 }, (_, i) => [`='Unit cost'!A${5+i}`, `='Unit cost'!B${5+i}`]);
fee.getRange("C5:E24").formulas = Array.from({ length: 20 }, (_, i) => [`='Unit cost'!D${5+i}`, `='Unit cost'!L${5+i}`, `='Unit cost'!O${5+i}`]);
fee.getRange("F5:G24").formulas = Array.from({ length: 20 }, (_, i) => [`=IF(OR(C${5+i}="UNKNOWN",E${5+i}="UNKNOWN"),"UNKNOWN",C${5+i}-E${5+i})`, `='Unit cost'!P${5+i}`]);
fee.getRange("H5:H24").values = Array.from({ length: 20 }, () => ["fee ≥ direct cost / (1 - 45%)"]);
money(fee, "C5:F24"); fee.getRange("G5:G24").conditionalFormats.addCustom('=G5="UNDERPRICED"', { fill: red, font: { color: "#9B1C1C", bold: true } });

baseSheet(notes, "Notes", "Assumptions, source mapping and unresolved inputs used by the workbook.");
notes.getRange("A4:C4").values = [["Assumption / source", "Value", "How it is used"]]; header(notes, "A4:C4");
notes.getRange("A5:C18").values = [
  ["Planning class size", 10, "Pricing rule and break-even contribution use direct cost per seat at 10 learners."],
  ["Maximum class size", 12, "Shown as the 12-learner sensitivity column."],
  ["Low class size case", 8, "Shown as the 8-learner sensitivity column."],
  ["Gross margin target", 0.45, "Target fee = direct cost per seat / (1 - 45%)."],
  ["Discounted learner share", 0.2, "20% of learners use one discount, per pricing-rules.md."],
  ["Early-bird discount", 0.1, "10% discount, per pricing-rules.md."],
  ["Bring-a-friend discount", 0.05, "5% discount, per pricing-rules.md."],
  ["Early-bird share of discounted learners", "UNKNOWN", "Not specified; discount-adjusted break-even remains UNKNOWN."],
  ["Bring-a-friend share of discounted learners", "UNKNOWN", "Not specified; expected discount cannot be derived."],
  ["Assistant wage", 60, "Per-session wage from fixed-costs.csv; included in course direct cost."],
  ["Instructor assignment", "Derived", "Course mapped to the instructor whose teaches field contains the course code."],
  ["Instructor rate", "Derived", "Rate per session from instructors.csv."],
  ["Monthly assistant session volume", "UNKNOWN", "No monthly session volume provided; not included in fixed-cost total."],
  ["Current fee mix", "Equal-weight average across 20 listed courses", "Used for the base break-even average fee and average direct cost."],
];
notes.getRange("A20:C24").values = [
  ["Source file", "Drive location", "Fields used"],
  ["courses.json", "Cook & Bake / Finance", "code, title, cat, fee"],
  ["recipe-costs.csv", "Cook & Bake / Finance", "sessions, ingredient cost, consumables"],
  ["instructors.csv", "Cook & Bake / Finance", "teaches, rate per session"],
  ["fixed-costs.csv / pricing-rules.md", "Cook & Bake / Finance", "fixed cost amounts, assistant wage, pricing formula"],
];
header(notes, "A20:C20"); notes.getRange("B8:B12").format.numberFormat = "0.0%"; money(notes, "B14:B14");

for (const sheet of [unit, fixed, be, fee, notes]) {
  sheet.getRange("A1:Z100").format.wrapText = false;
}
unit.getRange("A:Q").format.columnWidth = 13; unit.getRange("B:B").format.columnWidth = 34; unit.getRange("F:G").format.columnWidth = 21; unit.getRange("H:H").format.columnWidth = 24; unit.getRange("I:J").format.columnWidth = 17; unit.getRange("K:M").format.columnWidth = 19; unit.getRange("Q:Q").format.columnWidth = 42;
fixed.getRange("A:A").format.columnWidth = 45; fixed.getRange("B:B").format.columnWidth = 15; fixed.getRange("C:D").format.columnWidth = 28;
be.getRange("A:A").format.columnWidth = 40; be.getRange("B:B").format.columnWidth = 34;
fee.getRange("A:A").format.columnWidth = 12; fee.getRange("B:B").format.columnWidth = 34; fee.getRange("C:G").format.columnWidth = 18; fee.getRange("H:H").format.columnWidth = 36;
notes.getRange("A:A").format.columnWidth = 42; notes.getRange("B:B").format.columnWidth = 38; notes.getRange("C:C").format.columnWidth = 64;

wb.recalculate();
const errorScan = await wb.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!", options: { useRegex: true, maxResults: 100 }, summary: "formula error scan" });
await fs.writeFile(`${outDir}/error-scan.ndjson`, errorScan.ndjson ?? "");
const inspect = await wb.inspect({ kind: "table", range: "Break-even!A4:B16", include: "values,formulas", tableMaxRows: 20, tableMaxCols: 4 });
await fs.writeFile(`${outDir}/break-even-inspect.ndjson`, inspect.ndjson ?? "");
for (const [sheetName, range] of [["Unit cost", "A1:Q12"], ["Fixed costs", "A1:D18"], ["Break-even", "A1:B16"], ["Fee check", "A1:H12"], ["Notes", "A1:C24"]]) {
  const img = await wb.render({ sheetName, range, scale: 1, format: "png" });
  await fs.writeFile(`${outDir}/${sheetName.replace(/ /g, "-")}.png`, new Uint8Array(await img.arrayBuffer()));
}
const xlsx = await SpreadsheetFile.exportXlsx(wb);
await xlsx.save(`${outDir}/pricing-workbook.xlsx`);
console.log(JSON.stringify({ output: `${outDir}/pricing-workbook.xlsx`, errors: errorScan.ndjson ?? "", inspect: inspect.ndjson ?? "" }));
