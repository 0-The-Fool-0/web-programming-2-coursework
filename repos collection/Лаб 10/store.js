// Слой доступа к данным: чтение/запись массива рецептов в файл db.json.
const fs = require("fs/promises");
const path = require("path");

const DB_PATH = path.join(__dirname, "db.json");

async function readItems() {
  const raw = await fs.readFile(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

async function writeItems(items) {
  await fs.writeFile(DB_PATH, JSON.stringify(items, null, 2), "utf-8");
}

async function getAllItems() {
  return readItems();
}

async function getItemById(id) {
  const items = await readItems();
  return items.find((item) => item.id === id) || null;
}

async function addItem(data) {
  const items = await readItems();
  // Простейший автоинкремент id по максимуму среди существующих записей.
  const newId = items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1;

  const newItem = {
    id: newId,
    title: data.title,
    description: data.description,
    category: data.category,
    cookTimeMinutes: Number(data.cookTimeMinutes)
  };

  items.push(newItem);
  await writeItems(items);
  return newItem;
}

async function updateItem(id, data) {
  const items = await readItems();
  const index = items.findIndex((item) => item.id === id);

  if (index === -1) {
    return null;
  }

  const updated = {
    ...items[index],
    title: data.title,
    description: data.description,
    category: data.category,
    cookTimeMinutes: Number(data.cookTimeMinutes)
  };

  items[index] = updated;
  await writeItems(items);
  return updated;
}

async function deleteItem(id) {
  const items = await readItems();
  const index = items.findIndex((item) => item.id === id);

  if (index === -1) {
    return false;
  }

  items.splice(index, 1);
  await writeItems(items);
  return true;
}

module.exports = {
  getAllItems,
  getItemById,
  addItem,
  updateItem,
  deleteItem
};
