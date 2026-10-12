const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const restRouter = require("./rest");

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const PUBLIC_DIR = path.join(__dirname, "public");
const BUNDLE_HTML = path.join(PUBLIC_DIR, "index.html");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(PUBLIC_DIR));

app.get("/", (req, res) => {
  res.sendFile(BUNDLE_HTML);
});

app.use("/", restRouter);

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
