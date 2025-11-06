// server/index.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pino = require("pino");
const { analyze } = require("./routes/analyze");

const log = pino({ level: process.env.LOG_LEVEL || "info" });
const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/health", (req, res) => res.json({ ok: true }));
app.post("/api/analyze", analyze);

const port = Number(process.env.PORT || 3001);
app.listen(port, () => log.info({ port }, "API listening"));
