// Точка входа: создаём приложение Express, подключаем middleware и REST-маршруты.
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const restRouter = require("./rest");

const app = express();
// Порт для локальной разработки (на Render используют process.env.PORT).
const PORT = 3001;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Разбор JSON и form-urlencoded в req.body для POST/PUT.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Статика: CSS/JS из папки public отдаются по корню URL.
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index", { title: "Лабораторная 8 - Сборник рецептов" });
});

// Все маршруты из rest.js монтируются в корень (например, /items).
app.use("/", restRouter);

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
