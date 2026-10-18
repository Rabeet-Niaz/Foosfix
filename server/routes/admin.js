import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import Request from "../models/Request.js";
import requireAdmin from "../middleware/requireAdmin.js";
import mongoose from "mongoose";
import HotNews from "../models/HotNews.js";

const router = Router();

// Max 10 login attempts per IP every 15 minutes (stops password guessing)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { error: "Too many login attempts. Try again later." },
});

// POST /api/admin/login
router.post("/login", loginLimiter, async (req, res) => {
  const { username, password } = req.body ?? {};

  const okUser = username === process.env.ADMIN_USERNAME;
  const okPass = await bcrypt.compare(
    String(password ?? ""),
    process.env.ADMIN_PASSWORD_HASH ?? ""
  );

  if (!okUser || !okPass) {
    return res.status(401).json({ error: "Wrong username or password." });
  }

  const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
});

const STATUSES = ["pending", "done", "cant_fix"];
const PAGE_SIZE = 10;

// GET /api/admin/requests?status=pending&archived=true&page=1
router.get("/requests", requireAdmin, async (req, res) => {
  const filter = { archived: req.query.archived === "true" };

  if (STATUSES.includes(req.query.status)) {
    filter.status = req.query.status;
  }

  const page = Math.max(parseInt(req.query.page) || 1, 1);

  const found = await Request.find(filter)
    .select("+rollNo") // the admin is allowed to see roll numbers
    .sort({ createdAt: -1 })
    .skip((page - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE + 1)
    .populate("table", "name");

  res.json({
    items: found.slice(0, PAGE_SIZE),
    page,
    hasMore: found.length > PAGE_SIZE,
  });
});

// PATCH /api/admin/requests/:id/status   body: { "status": "done" }
router.patch("/requests/:id/status", requireAdmin, async (req, res) => {
    const { status } = req.body ?? {};
  
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ error: "Status must be pending, done or cant_fix." });
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: "Request not found." });
    }
  
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status, doneAt: status === "done" ? new Date() : null },
      { new: true }
    )
      .select("+rollNo")
      .populate("table", "name");
  
    if (!request) return res.status(404).json({ error: "Request not found." });
    res.json(request);
  });

// POST /api/admin/requests/:id/comments   body: { "text": "Rod replaced." }
router.post("/requests/:id/comments", requireAdmin, async (req, res) => {
    const text = String(req.body?.text ?? "").trim();
  
    if (!text) return res.status(400).json({ error: "Comment cannot be empty." });
    if (text.length > 500) {
      return res.status(400).json({ error: "Comment must be 500 characters or less." });
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: "Request not found." });
    }
  
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { text } } }, // adds to the list, keeps the old comments
      { new: true }
    )
      .select("+rollNo")
      .populate("table", "name");
  
    if (!request) return res.status(404).json({ error: "Request not found." });
    res.json(request);
  });

// PATCH /api/admin/requests/:id/archive   body: { "archived": true }
router.patch("/requests/:id/archive", requireAdmin, async (req, res) => {
    const archived = req.body?.archived;
  
    if (typeof archived !== "boolean") {
      return res.status(400).json({ error: "archived must be true or false." });
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: "Request not found." });
    }
  
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { archived },
      { new: true }
    )
      .select("+rollNo")
      .populate("table", "name");
  
    if (!request) return res.status(404).json({ error: "Request not found." });
    res.json(request);
  });

// POST /api/admin/hotnews   body: { "text": "Table 2 is fixed." }
router.post("/hotnews", requireAdmin, async (req, res) => {
    const text = String(req.body?.text ?? "").trim();
  
    if (!text) return res.status(400).json({ error: "News cannot be empty." });
    if (text.length > 300) {
      return res.status(400).json({ error: "News must be 300 characters or less." });
    }
  
    const post = await HotNews.create({ text });
    res.status(201).json(post);
  });

// GET /api/admin/counts  ->  { pending: 2, done: 1, cant_fix: 1 }
router.get("/counts", requireAdmin, async (_req, res) => {
    const rows = await Request.aggregate([
      { $match: { archived: false } },
      { $group: { _id: "$status", n: { $sum: 1 } } },
    ]);
  
    const counts = { pending: 0, done: 0, cant_fix: 0 };
    for (const r of rows) counts[r._id] = r.n;
  
    res.json(counts);
  });

export default router;