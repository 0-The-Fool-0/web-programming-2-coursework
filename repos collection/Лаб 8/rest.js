// REST API: маршруты HTTP сопоставляются с функциями слоя хранения (store).
const express = require("express");
const {
  getAllItems,
  getItemById,
  addItem,
  updateItem,
  deleteItem
} = require("./store");

const router = express.Router();

// Проверка обязательных полей тела запроса перед созданием/обновлением записи.
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

// Коллекция рецептов (полный список из JSON).
router.get("/items", async (req, res) => {
  const items = await getAllItems();
  res.json(items);
});

// Одна запись по числовому id из URL.
router.get("/items/:id", async (req, res) => {
  const id = Number(req.params.id);
  const item = await getItemById(id);

  if (!item) {
    return res.status(404).json({ message: "Запись не найдена" });
  }

  return res.json(item);
});

// Создание: тело в JSON, ответ 201 Created.
router.post("/items", async (req, res) => {
  const error = validatePayload(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const created = await addItem(req.body);
  return res.status(201).json(created);
});

// Полная замена полей записи по id.
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

// Удаление: при успехе тело не возвращаем (204 No Content).
router.delete("/items/:id", async (req, res) => {
  const id = Number(req.params.id);
  const deleted = await deleteItem(id);

  if (!deleted) {
    return res.status(404).json({ message: "Запись не найдена" });
  }

  return res.status(204).send();
});

module.exports = router;
