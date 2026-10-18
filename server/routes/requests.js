import { Router } from "express";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import Request from "../models/Request.js";
import Table from "../models/Table.js";
import Counter from "../models/Counter.js";
import uploadPhotos from "../middleware/uploadPhotos.js";
import { uploadImage } from "../config/cloudinary.js";

const router = Router();
const STATUSES = ["pending", "done", "cant_fix"];
const PAGE_SIZE = 10;

// GET /api/requests?status=done&lastMonth=true&page=1
router.get("/", async (req, res) => {
  const filter = { archived: false }; // archived requests are never public

  if (STATUSES.includes(req.query.status)) {
    filter.status = req.query.status;
  }

  if (req.query.lastMonth === "true") {
    const since = new Date();
    since.setMonth(since.getMonth() - 1);
    filter.createdAt = { $gte: since };
  }

  const page = Math.max(parseInt(req.query.page) || 1, 1);

  // Ask for one extra item to know if a "Load more" button is needed
  const found = await Request.find(filter)
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

// Spam protection: 5 reports per IP every 10 minutes
const submitLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 5,
    message: { error: "Too many requests. Please try again later." },
  });
  
// POST /api/requests  (text fields + up to 3 photos)
router.post("/", submitLimiter, uploadPhotos, async (req, res) => {
    const { tableId, description, rollNo } = req.body ?? {};
  
    if (!mongoose.isValidObjectId(tableId) || !(await Table.exists({ _id: tableId }))) {
      return res.status(400).json({ error: "Please choose a valid table." });
    }
  
    const request = new Request({
      requestId: "pending", // placeholder, replaced below
      table: tableId,
      description,
      rollNo: rollNo || undefined,
    });
  
    // Check the text fields BEFORE uploading any photo
    try {
      await request.validate();
    } catch (err) {
      const first = Object.values(err.errors ?? {})[0];
      return res.status(400).json({ error: first?.message ?? "Invalid request." });
    }
  
    try {
      request.photos = await Promise.all((req.files ?? []).map((f) => uploadImage(f.buffer)));
    } catch {
      return res.status(502).json({ error: "Photo upload failed. Please try again." });
    }
  
    // Take the request number only after everything else succeeded
    const n = await Counter.next("request");
    request.requestId = `FF-${String(n).padStart(4, "0")}`;
    await request.save();
  
    res.status(201).json({ id: request._id, requestId: request.requestId });
  });

export default router;