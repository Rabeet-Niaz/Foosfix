import "dotenv/config";
import mongoose from "mongoose";
import Request from "./models/Request.js";
import Counter from "./models/Counter.js";
import HotNews from "./models/HotNews.js";

if (!process.argv.includes("--yes")) {
  console.log("This deletes ALL requests, hot news and the ID counter.");
  console.log("Run it again as: node reset.js --yes");
  process.exit(0);
}

await mongoose.connect(process.env.MONGO_URI);
const requests = await Request.deleteMany({});
const news = await HotNews.deleteMany({});
await Counter.deleteMany({});
console.log(`Deleted ${requests.deletedCount} requests and ${news.deletedCount} hot news posts. Counter reset.`);
await mongoose.disconnect();