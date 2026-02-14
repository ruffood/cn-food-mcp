# cn-food-mcp

MCP server for Chinese food nutrition data. Provides ~1725 foods with 25 nutrients per 100g.

## Usage

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "cn-food": {
      "command": "npx",
      "args": ["-y", "cn-food-mcp"]
    }
  }
}
```

### Cursor

Add to Cursor MCP settings:

```json
{
  "mcpServers": {
    "cn-food": {
      "command": "npx",
      "args": ["-y", "cn-food-mcp"]
    }
  }
}
```

## Tools

### `list_nutrients`

List all available nutrient fields with Chinese/English names and units.

**Parameters:** none

**Example:** `{}`

```json
{
  "per_100g": true,
  "nutrients": [
    { "field": "energy", "name_cn": "能量", "name_en": "Energy", "unit": "kcal" },
    { "field": "protein", "name_cn": "蛋白质", "name_en": "Protein", "unit": "g" },
    { "field": "carbohydrate", "name_cn": "糖类", "name_en": "Carbohydrate", "unit": "g" },
    { "field": "fat", "name_cn": "脂肪", "name_en": "Fat", "unit": "g" },
    { "field": "vitamin_a", "name_cn": "维生素A", "name_en": "Vitamin A", "unit": "μg" },
    { "field": "calcium", "name_cn": "钙", "name_en": "Calcium", "unit": "mg" },
    "... (25 nutrients total)"
  ]
}
```

### `search_food`

Search foods by name.

**Parameters:**
- `query` (string) — Food name keyword

**Example:** `{ "query": "豆腐" }`

```json
{
  "count": 20,
  "foods": [
    {
      "id": 285,
      "name": "豆腐",
      "energy_kcal": 81,
      "protein_g": 8.1,
      "fat_g": 3.7,
      "carbohydrate_g": 3.8
    },
    {
      "id": 286,
      "name": "豆腐(北)",
      "energy_kcal": 98,
      "protein_g": 12.2,
      "fat_g": 4.8,
      "carbohydrate_g": 1.5
    }
  ]
}
```

### `get_nutrition`

Get full nutrition data for a food by ID (from `search_food`).

**Parameters:**
- `food_id` (number) — Food ID

**Example:** `{ "food_id": 579 }`

```json
{
  "id": 579,
  "name": "鸡蛋(白皮)",
  "energy": 138,
  "protein": 12.7,
  "carbohydrate": 1.5,
  "fat": 9,
  "water": 75.8,
  "fiber": 0,
  "ash": 1,
  "vitamin_a": 310,
  "carotene": 0,
  "retinol_equivalent": 310,
  "vitamin_b1": 0.09,
  "vitamin_b2": 0.31,
  "niacin": 0.2,
  "vitamin_c": 0,
  "vitamin_e": 1.23,
  "potassium": 98,
  "sodium": 94.7,
  "calcium": 48,
  "magnesium": 14,
  "iron": 2,
  "manganese": 0.03,
  "zinc": 1,
  "copper": 0.06,
  "phosphorus": 176,
  "selenium": 16.55,
  "unit": 100
}
```

### `compare_foods`

Compare nutrition of 2-5 foods side by side.

**Parameters:**
- `food_ids` (number[]) — Array of 2-5 food IDs

**Example:** `{ "food_ids": [579, 580, 586] }`

```json
{
  "unit": 100,
  "foods": [
    { "id": 579, "name": "鸡蛋(白皮)", "energy": 138, "protein": 12.7, "fat": 9, "..." : "..." },
    { "id": 580, "name": "鸡蛋(红皮)", "energy": 156, "protein": 12.8, "fat": 11.1, "..." : "..." },
    { "id": 586, "name": "鸡蛋黄", "energy": 328, "protein": 15.2, "fat": 28.2, "..." : "..." }
  ]
}
```

### `filter_by_nutrient`

Filter foods by nutrient range.

**Parameters:**
- `nutrient` (string) — One of: `energy`, `protein`, `carbohydrate`, `fat`, `water`, `fiber`, `ash`, `vitamin_a`, `carotene`, `retinol_equivalent`, `vitamin_b1`, `vitamin_b2`, `niacin`, `vitamin_c`, `vitamin_e`, `potassium`, `sodium`, `calcium`, `magnesium`, `iron`, `manganese`, `zinc`, `copper`, `phosphorus`, `selenium`
- `min` (number, optional) — Minimum value (inclusive)
- `max` (number, optional) — Maximum value (inclusive)
- `limit` (number, optional) — Max results, default 20
- `sort` (`"asc"` | `"desc"`, optional) — Sort order, default `"desc"`

**Example:** `{ "nutrient": "protein", "min": 30, "sort": "desc", "limit": 3 }`

```json
{
  "nutrient": "protein",
  "count": 3,
  "foods": [
    { "id": 875, "name": "骆驼掌", "protein": 72.8 },
    { "id": 899, "name": "曼氏无针乌贼", "protein": 65.3 },
    { "id": 959, "name": "墨鱼(干)", "protein": 65.3 }
  ]
}
```

## License

MIT
