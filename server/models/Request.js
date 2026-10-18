import mongoose from "mongoose";

const photoSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
);

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true, maxlength: 500 },
  createdAt: { type: Date, default: Date.now },
});

const requestSchema = new mongoose.Schema(
  {
    requestId: { type: String, required: true, unique: true }, // like FF-0001
    rollNo: {
      type: String,
      uppercase: true,
      trim: true,
      match: [/^[A-Z]{4}\d{2}[A-Z]\d{3}$/, "Roll number must look like BITF25A001"],
      select: false, // never returned unless we ask for it (keeps it private)
    },
    table: { type: mongoose.Schema.Types.ObjectId, ref: "Table", required: true },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    photos: {
      type: [photoSchema],
      validate: [(v) => v.length <= 3, "Maximum 3 photos"],
      default: [],
    },
    status: { type: String, enum: ["pending", "done", "cant_fix"], default: "pending" },
    comments: { type: [commentSchema], default: [] },
    archived: { type: Boolean, default: false },
    doneAt: Date,
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

requestSchema.index({ archived: 1, createdAt: -1 });

export default mongoose.model("Request", requestSchema);