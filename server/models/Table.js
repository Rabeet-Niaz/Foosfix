import mongoose from "mongoose";

const tableSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true }, // "Yellow table", "Red table"
    location: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Table", tableSchema);