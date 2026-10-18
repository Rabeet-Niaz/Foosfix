import { Router } from "express";
import Table from "../models/Table.js";

const router = Router();

// GET /api/tables  ->  list of tables for the dropdown
router.get("/", async (_req, res) => {
  const tables = await Table.find().sort({ name: 1 }).select("name location");
  res.json(tables);
});

export default router;