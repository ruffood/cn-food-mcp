import { readFileSync, writeFileSync } from "fs";
import { parse } from "csv-parse/sync";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const csvPath = path.join(__dirname, "..", "data2026.csv");
const outPath = path.join(__dirname, "..", "src", "data", "foods.json");

const COLUMNS = [
  "name",
  "energy",
  "protein",
  "carbohydrate",
  "fat",
  "water",
  "fiber",
  "ash",
  "vitamin_a",
  "carotene",
  "retinol_equivalent",
  "vitamin_b1",
  "vitamin_b2",
  "niacin",
  "vitamin_c",
  "vitamin_e",
  "potassium",
  "sodium",
  "calcium",
  "magnesium",
  "iron",
  "manganese",
  "zinc",
  "copper",
  "phosphorus",
  "selenium",
] as const;

// Strip UTF-8 BOM if present
const csv = readFileSync(csvPath, "utf-8").replace(/^\uFEFF/, "");

const rows: string[][] = parse(csv, {
  columns: false,
  relax_column_count: true,
  skip_empty_lines: true,
});

// First row is the multi-line header, skip it
const dataRows = rows.slice(1);

const foods = dataRows.map((row, i) => {
  const food: Record<string, string | number | null> = { id: i + 1 };

  for (let col = 0; col < COLUMNS.length; col++) {
    const key = COLUMNS[col];
    const raw = (row[col] ?? "").trim();

    if (key === "name") {
      // Clean up food name: remove trailing database codes like ",A01004"
      food[key] = raw.replace(/,\s*[A-Z]\d+.*$/, "").trim();
    } else {
      const num = parseFloat(raw);
      food[key] = isNaN(num) ? null : num;
    }
  }

  return food;
});

writeFileSync(outPath, JSON.stringify(foods), "utf-8");
console.log(`Converted ${foods.length} food items → ${outPath}`);

// Spot check
const sample = foods.find((f) => f.name === "鸡蛋");
if (sample) {
  console.log("Spot check (鸡蛋):", JSON.stringify(sample, null, 2));
}
