import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import tablesRouter from "./routes/tables.js";
import requestsRouter from "./routes/requests.js";
import hotNewsRouter from "./routes/hotnews.js";
import adminRouter from "./routes/admin.js";

const app = express();
app.set("trust proxy", 1);

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_ORIGIN }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});
app.use("/api/tables", tablesRouter);
app.use("/api/requests", requestsRouter);
app.use("/api/hotnews", hotNewsRouter);
app.use("/api/admin", adminRouter);

const port = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(port, () => console.log(`API running on port ${port}`));
});
