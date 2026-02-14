import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

// Load food data
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, "data", "foods.json");
const foods: Food[] = JSON.parse(readFileSync(dataPath, "utf-8"));

interface Food {
  id: number;
  name: string;
  energy: number | null;
  protein: number | null;
  carbohydrate: number | null;
  fat: number | null;
  water: number | null;
  fiber: number | null;
  ash: number | null;
  vitamin_a: number | null;
  carotene: number | null;
  retinol_equivalent: number | null;
  vitamin_b1: number | null;
  vitamin_b2: number | null;
  niacin: number | null;
  vitamin_c: number | null;
  vitamin_e: number | null;
  potassium: number | null;
  sodium: number | null;
  calcium: number | null;
  magnesium: number | null;
  iron: number | null;
  manganese: number | null;
  zinc: number | null;
  copper: number | null;
  phosphorus: number | null;
  selenium: number | null;
}

const NUTRIENT_KEYS = [
  "energy", "protein", "carbohydrate", "fat", "water", "fiber", "ash",
  "vitamin_a", "carotene", "retinol_equivalent",
  "vitamin_b1", "vitamin_b2", "niacin", "vitamin_c", "vitamin_e",
  "potassium", "sodium", "calcium", "magnesium",
  "iron", "manganese", "zinc", "copper", "phosphorus", "selenium",
] as const;

type NutrientKey = typeof NUTRIENT_KEYS[number];

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

function summaryOf(food: Food) {
  return {
    id: food.id,
    name: food.name,
    energy_kcal: food.energy,
    protein_g: food.protein,
    fat_g: food.fat,
    carbohydrate_g: food.carbohydrate,
  };
}

// Create MCP server
const server = new McpServer({
  name: "cn-food-mcp",
  version: "1.0.0",
});

const NUTRIENT_UNITS: Record<NutrientKey, { name_cn: string; name_en: string; unit: string }> = {
  energy:              { name_cn: "能量",       name_en: "Energy",              unit: "kcal" },
  protein:             { name_cn: "蛋白质",     name_en: "Protein",             unit: "g" },
  carbohydrate:        { name_cn: "糖类",       name_en: "Carbohydrate",        unit: "g" },
  fat:                 { name_cn: "脂肪",       name_en: "Fat",                 unit: "g" },
  water:               { name_cn: "水分",       name_en: "Water",               unit: "g" },
  fiber:               { name_cn: "纤维",       name_en: "Fiber",               unit: "g" },
  ash:                 { name_cn: "灰份",       name_en: "Ash",                 unit: "g" },
  vitamin_a:           { name_cn: "维生素A",    name_en: "Vitamin A",           unit: "μg" },
  carotene:            { name_cn: "胡萝卜素",   name_en: "Carotene",            unit: "μg" },
  retinol_equivalent:  { name_cn: "视黄醇当量", name_en: "Retinol Equivalent",  unit: "μg" },
  vitamin_b1:          { name_cn: "维生素B1",   name_en: "Vitamin B1",          unit: "mg" },
  vitamin_b2:          { name_cn: "维生素B2",   name_en: "Vitamin B2",          unit: "mg" },
  niacin:              { name_cn: "烟酸",       name_en: "Niacin",              unit: "mg" },
  vitamin_c:           { name_cn: "维生素C",    name_en: "Vitamin C",           unit: "mg" },
  vitamin_e:           { name_cn: "维生素E",    name_en: "Vitamin E",           unit: "mg" },
  potassium:           { name_cn: "钾",         name_en: "Potassium",           unit: "mg" },
  sodium:              { name_cn: "钠",         name_en: "Sodium",              unit: "mg" },
  calcium:             { name_cn: "钙",         name_en: "Calcium",             unit: "mg" },
  magnesium:           { name_cn: "镁",         name_en: "Magnesium",           unit: "mg" },
  iron:                { name_cn: "铁",         name_en: "Iron",                unit: "mg" },
  manganese:           { name_cn: "锰",         name_en: "Manganese",           unit: "mg" },
  zinc:                { name_cn: "锌",         name_en: "Zinc",                unit: "mg" },
  copper:              { name_cn: "铜",         name_en: "Copper",              unit: "mg" },
  phosphorus:          { name_cn: "磷",         name_en: "Phosphorus",          unit: "mg" },
  selenium:            { name_cn: "硒",         name_en: "Selenium",            unit: "μg" },
};

// Tool 1: list_nutrients
server.tool(
  "list_nutrients",
  "列出所有可查询的营养素字段名、中英文名称和单位",
  {},
  async () => {
    const nutrients = NUTRIENT_KEYS.map((key) => ({
      field: key,
      ...NUTRIENT_UNITS[key],
    }));
    return json({ per_100g: true, nutrients });
  },
);

// Tool 2: search_food
server.tool(
  "search_food",
  "按名称搜索中国食物，返回匹配的食物列表（含ID、名称、主要营养素摘要）",
  { query: z.string().describe("食物名称关键词，如「鸡蛋」「牛肉」「米饭」") },
  async ({ query }) => {
    const q = query.toLowerCase();
    const results = foods.filter((f) => f.name.toLowerCase().includes(q)).slice(0, 20);
    return json({ count: results.length, foods: results.map(summaryOf) });
  },
);

// Tool 2: get_nutrition
server.tool(
  "get_nutrition",
  "获取某个食物的完整营养成分（每100g），需提供食物ID（通过 search_food 获取）",
  { food_id: z.number().int().positive().describe("食物ID") },
  async ({ food_id }) => {
    const food = foods.find((f) => f.id === food_id);
    if (!food) {
      return json({ error: `未找到 ID 为 ${food_id} 的食物` });
    }
    return json({ ...food, unit: 100 });
  },
);

// Tool 3: compare_foods
server.tool(
  "compare_foods",
  "对比多个食物的营养成分（每100g），提供2-5个食物ID",
  {
    food_ids: z.array(z.number().int().positive()).min(2).max(5).describe("食物ID数组"),
  },
  async ({ food_ids }) => {
    const found = food_ids.map((id) => foods.find((f) => f.id === id)).filter(Boolean) as Food[];

    if (found.length < 2) {
      return json({ error: "至少需要找到2个有效食物进行对比" });
    }

    return json({
      unit: 100,
      foods: found.map((f) => ({ ...f })),
    });
  },
);

// Tool 4: filter_by_nutrient
server.tool(
  "filter_by_nutrient",
  "按营养素范围筛选食物，如查找高蛋白、低脂肪的食物",
  {
    nutrient: z.enum(NUTRIENT_KEYS as unknown as [string, ...string[]]).describe("营养素字段名"),
    min: z.number().optional().describe("最小值（含）"),
    max: z.number().optional().describe("最大值（含）"),
    limit: z.number().int().min(1).max(50).default(20).describe("返回数量上限，默认20"),
    sort: z.enum(["asc", "desc"]).default("desc").describe("排序方向，默认降序"),
  },
  async ({ nutrient, min, max, limit, sort }) => {
    const key = nutrient as NutrientKey;
    let results = foods.filter((f) => {
      const val = f[key];
      if (val === null) return false;
      if (min !== undefined && val < min) return false;
      if (max !== undefined && val > max) return false;
      return true;
    });

    results.sort((a, b) => {
      const va = a[key] ?? 0;
      const vb = b[key] ?? 0;
      return sort === "desc" ? vb - va : va - vb;
    });

    results = results.slice(0, limit);

    return json({
      nutrient,
      count: results.length,
      foods: results.map((f) => ({
        id: f.id,
        name: f.name,
        [nutrient]: f[key],
      })),
    });
  },
);

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Failed to start MCP server:", err);
  process.exit(1);
});
