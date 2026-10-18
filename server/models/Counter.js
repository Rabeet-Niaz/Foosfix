import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

// Returns the next number for a counter, like 1, 2, 3...
// $inc is atomic, so two simultaneous requests never get the same number.
counterSchema.statics.next = async function (name) {
  const doc = await this.findOneAndUpdate(
    { name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return doc.seq;
};

export default mongoose.model("Counter", counterSchema);