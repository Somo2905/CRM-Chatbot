import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  make: String,
  model: String,
  year: Number,
  lastServiceDate: Date,
  warrantyEndDate: Date
});

export default mongoose.model("Vehicle", vehicleSchema);
