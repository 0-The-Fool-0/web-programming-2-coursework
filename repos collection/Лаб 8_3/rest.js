// REST API рецептов; GET /items поддерживает пагинацию, сортировку и поиск (query).
const express = require("express");
const {
  getAllItems,
  getItemById,
  addItem,
  updateItem,
  deleteItem
} = require("./store");

const router = express.Router();

// Проверка полей рецепта перед POST/PUT.
function validatePayload(payload) {
  if (!payload || typeof payload !== "object") {
    return "Тело запроса отсутствует.";
  }

  const required = ["title", "description", "category", "cookTimeMinutes"];
  for (const field of required) {
    if (!payload[field] && payload[field] !== 0) {
      return `Поле "${field}" обязательно.`;
    }
  }

  if (!Number.isFinite(Number(payload.cookTimeMinutes)) || Number(payload.cookTimeMinutes) <= 0) {
    return "cookTimeMinutes должен быть положительным числом.";
  }

  return null;
}

router.get("/items", async (req, res) => {
  // Параметры из строки запроса ?page=1&limit=5&sort=asc&q=...
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 5));
  const sort = req.query.sort === "desc" ? "desc" : "asc";
  const query = typeof req.query.q === "string" ? req.query.q.trim().toLowerCase() : "";

  let items = await getAllItems();

  if (query) {
    items = items.filter((item) => item.title.toLowerCase().includes(query));
  }

  // Копия массива, чтобы не мутировать порядок в кэше readItems при повторных запросах.
  items = [...items].sort((a, b) => {
    const byTitle = a.title.localeCompare(b.title, "ru", { sensitivity: "base" });
    return sort === "desc" ? -byTitle : byTitle;
  });

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * limit;
  const pagedItems = items.slice(start, start + limit);

  res.json({
    items: pagedItems,
    pagination: {
      page: currentPage,
      limit,
      totalItems,
      totalPages
    },
    filters: {
      sort,
      q: query
    }
  });
});

router.get("/items/:id", async (req, res) => {
  const id = Number(req.params.id);
  const item = await getItemById(id);

  if (!item) {
    return res.status(404).json({ message: "Запись не найдена" });
  }

  return res.json(item);
});

router.post("/items", async (req, res) => {
  const error = validatePayload(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const created = await addItem(req.body);
  return res.status(201).json(created);
});

router.put("/items/:id", async (req, res) => {
  const id = Number(req.params.id);
  const error = validatePayload(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const updated = await updateItem(id, req.body);
  if (!updated) {
    return res.status(404).json({ message: "Запись не найдена" });
  }

  return res.json(updated);
});

router.delete("/items/:id", async (req, res) => {
  const id = Number(req.params.id);
  const deleted = await deleteItem(id);

  if (!deleted) {
    return res.status(404).json({ message: "Запись не найдена" });
  }

  return res.status(204).send();
});

module.exports = router;
