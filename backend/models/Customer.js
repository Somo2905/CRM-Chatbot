import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name: String,
  phone: { type: String, unique: true },
  dlLast4: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Customer", customerSchema);
