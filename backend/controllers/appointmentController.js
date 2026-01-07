import ServiceSlot from "../models/ServiceSlot.js";
import Appointment from "../models/Appointment.js";
import Vehicle from "../models/Vehicle.js";

/**
 * Book a service appointment using available slots
 */
export async function bookService({ customerId, preferredDate }) {
  // Normalize preferredDate to midnight UTC for matching
  const normalizedDate = new Date(preferredDate);
  normalizedDate.setHours(0, 0, 0, 0);

  const slot = await ServiceSlot.findOne({
    date: normalizedDate,
    isActive: true,
    $expr: { $lt: ["$bookedCount", "$capacity"] }
  });

  if (!slot) {
    console.log(`No slot found for date: ${normalizedDate.toISOString()}, customerId: ${customerId}`);
    return { success: false };
  }

  const vehicle = await Vehicle.findOne({ customerId });

  if (!vehicle) {
    console.log(`No vehicle found for customerId: ${customerId}`);
    return { success: false };
  }

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
