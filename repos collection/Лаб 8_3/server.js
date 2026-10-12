const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const restRouter = require("./rest");

const app = express();
// На Render порт задаётся через переменную окружения PORT.
const PORT = Number(process.env.PORT) || 3002;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index", { title: "Лабораторная 8_3 - Сборник рецептов" });
});

app.use("/", restRouter);

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
