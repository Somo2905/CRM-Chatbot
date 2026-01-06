import ServiceSlot from "../models/ServiceSlot.js";
import Appointment from "../models/Appointment.js";
import Vehicle from "../models/Vehicle.js";

/**
 * Book a service appointment using available slots
 */
export async function bookService({ customerId, preferredDate }) {
  const slot = await ServiceSlot.findOne({
    date: preferredDate,
    isActive: true,
    $expr: { $lt: ["$bookedCount", "$capacity"] }
  });

  if (!slot) {
    return { success: false };
  }

  const vehicle = await Vehicle.findOne({ customerId });

  const appointment = await Appointment.create({
    customerId,
    vehicleId: vehicle._id,
    date: slot.date,
    time: slot.time,
    status: "BOOKED",
    createdAt: new Date()
  });

  slot.bookedCount += 1;
  await slot.save();

  return { success: true, appointment };
}
