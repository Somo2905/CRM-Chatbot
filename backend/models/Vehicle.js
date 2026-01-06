import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  model: String,
  lastServiceDate: Date,
  warrantyEndDate: Date
});

export default mongoose.model("Vehicle", vehicleSchema);
