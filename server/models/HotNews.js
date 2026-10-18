import mongoose from "mongoose";

const hotNewsSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true, maxlength: 300 },
  postedAt: { type: Date, default: Date.now },
});

export default mongoose.model("HotNews", hotNewsSchema);