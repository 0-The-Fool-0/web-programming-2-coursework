const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

const publicDir = path.join(__dirname, "public");
const indexFile = path.join(publicDir, "index.html");
const recipesJsonFile = path.join(__dirname, "data", "recipes.json");

app.use(express.static(publicDir));

// URL 1: отдаем главную страницу SPA
app.get("/", (request, response) => {
    response.sendFile(indexFile);
});

// AJAX-URL: отдача JSON-данных для таблицы на главной странице
app.get("/api/recipes", (request, response) => {
    response.sendFile(recipesJsonFile);
});

// URL 2: скачивание JSON-файла с данными
app.get("/download-recipes-json", (request, response) => {
    response.download(recipesJsonFile, "recipes.json");
});

app.listen(PORT, () => {
    console.log("Express server started: http://localhost:" + PORT);
});
