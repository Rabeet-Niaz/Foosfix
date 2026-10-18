import { Router } from "express";
import HotNews from "../models/HotNews.js";

const router = Router();

// GET /api/hotnews  ->  the latest post, or null if there are none yet
router.get("/", async (_req, res) => {
  const latest = await HotNews.findOne().sort({ postedAt: -1 });
  res.json(latest);
});

export default router;