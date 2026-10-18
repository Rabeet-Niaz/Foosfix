import "dotenv/config";
import mongoose from "mongoose";
import Table from "./models/Table.js";

const tables = [
  { name: "Yellow table", location: "" },
  { name: "Red table", location: "" },
];

await mongoose.connect(process.env.MONGO_URI);

for (const t of tables) {
  await Table.updateOne({ name: t.name }, { $setOnInsert: t }, { upsert: true });
}

console.log("Tables ready:", tables.map((t) => t.name).join(", "));
await mongoose.disconnect();