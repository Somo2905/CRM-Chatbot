import ServiceSlot from "../models/ServiceSlot.js";

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export async function seedServiceSlots() {
  try {
    // Remove the check that prevents seeding if data exists
    // Now it will always run when called

    const now = new Date();
    const slots = [];

    // create slots for the next 7 days with 3 time slots each
    const times = ["09:00", "11:00", "14:00"];
    for (let day = 0; day < 7; day++) {
      const date = addDays(now, day);
      // normalize to midnight UTC (so stored date has no time component)
      date.setHours(0, 0, 0, 0);

      for (const t of times) {
        slots.push({
          date,
          time: t,
          capacity: 3,
          bookedCount: 0,
          isActive: true
        });
      }
    }

    await ServiceSlot.insertMany(slots);
    console.log(`ServiceSlot seeder: inserted ${slots.length} dummy slots.`);
    slots.forEach(s => console.log(`  - ${s.date.toISOString()} at ${s.time}`));
  } catch (err) {
    console.error("ServiceSlot seeder error:", err);
  }
}
