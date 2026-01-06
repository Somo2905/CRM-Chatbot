import mongoose from "mongoose";

const serviceSlotSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  time: { type: String, required: true }, // "10:00", "11:00"
  capacity: { type: Number, required: true }, // total slots
  bookedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
});

export default mongoose.model("ServiceSlot", serviceSlotSchema);
