import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
  date: Date,
  time: String,
  status: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Appointment", appointmentSchema);
