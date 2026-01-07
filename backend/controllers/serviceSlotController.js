import ServiceSlot from "../models/ServiceSlot.js";

/**
 * Get all service slots with filters
 */
export async function getAllServiceSlots(req, res) {
  try {
    const { page = 1, limit = 20, startDate, endDate, isActive } = req.query;
    
    let query = {};
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    const slots = await ServiceSlot.find(query)
      .sort({ date: 1, time: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await ServiceSlot.countDocuments(query);

    return res.json({
      slots,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error("Error fetching service slots:", error);
    return res.status(500).json({ error: "Failed to fetch service slots" });
  }
}

/**
 * Get available slots for a specific date
 */
export async function getAvailableSlots(req, res) {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: "Date parameter is required" });
    }

    const searchDate = new Date(date);
    searchDate.setHours(0, 0, 0, 0);

    const slots = await ServiceSlot.find({
      date: searchDate,
      isActive: true,
      $expr: { $lt: ["$bookedCount", "$capacity"] }
    })
    .sort({ time: 1 })
    .lean();

    return res.json({ slots });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    return res.status(500).json({ error: "Failed to fetch available slots" });
  }
}

/**
 * Create a new service slot
 */
export async function createServiceSlot(req, res) {
  try {
    const { date, time, capacity } = req.body;

    if (!date || !time || !capacity) {
      return res.status(400).json({ error: "Date, time, and capacity are required" });
    }

    const slotDate = new Date(date);
    slotDate.setHours(0, 0, 0, 0);

    // Check if slot already exists
    const existing = await ServiceSlot.findOne({ date: slotDate, time });
    if (existing) {
      return res.status(400).json({ error: "Slot already exists for this date and time" });
    }

    const slot = await ServiceSlot.create({
      date: slotDate,
      time,
      capacity: Number(capacity),
      bookedCount: 0,
      isActive: true
    });

    return res.status(201).json({ slot });
  } catch (error) {
    console.error("Error creating service slot:", error);
    return res.status(500).json({ error: "Failed to create service slot" });
  }
}

/**
 * Create multiple slots (bulk creation)
 */
export async function createBulkServiceSlots(req, res) {
  try {
    const { startDate, endDate, times, capacity } = req.body;

    if (!startDate || !endDate || !times || !Array.isArray(times) || !capacity) {
      return res.status(400).json({ 
        error: "Start date, end date, times array, and capacity are required" 
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const slotsToCreate = [];

    // Generate slots for each day and time
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const slotDate = new Date(d);
      slotDate.setHours(0, 0, 0, 0);

      for (const time of times) {
        // Check if slot already exists
        const existing = await ServiceSlot.findOne({ date: slotDate, time });
        if (!existing) {
          slotsToCreate.push({
            date: slotDate,
            time,
            capacity: Number(capacity),
            bookedCount: 0,
            isActive: true
          });
        }
      }
    }

    if (slotsToCreate.length === 0) {
      return res.status(400).json({ error: "All slots already exist" });
    }

    const slots = await ServiceSlot.insertMany(slotsToCreate);

    return res.status(201).json({ 
      message: `Created ${slots.length} slots`,
      slots 
    });
  } catch (error) {
    console.error("Error creating bulk service slots:", error);
    return res.status(500).json({ error: "Failed to create bulk service slots" });
  }
}

/**
 * Update service slot
 */
export async function updateServiceSlot(req, res) {
  try {
    const { id } = req.params;
    const { capacity, isActive, bookedCount } = req.body;

    const slot = await ServiceSlot.findById(id);
    if (!slot) {
      return res.status(404).json({ error: "Service slot not found" });
    }

    if (capacity !== undefined) slot.capacity = Number(capacity);
    if (isActive !== undefined) slot.isActive = isActive;
    if (bookedCount !== undefined) slot.bookedCount = Number(bookedCount);

    await slot.save();

    return res.json({ slot });
  } catch (error) {
    console.error("Error updating service slot:", error);
    return res.status(500).json({ error: "Failed to update service slot" });
  }
}

/**
 * Delete service slot
 */
export async function deleteServiceSlot(req, res) {
  try {
    const { id } = req.params;

    const slot = await ServiceSlot.findById(id);
    if (!slot) {
      return res.status(404).json({ error: "Service slot not found" });
    }

    if (slot.bookedCount > 0) {
      return res.status(400).json({ 
        error: "Cannot delete slot with bookings. Deactivate it instead." 
      });
    }

    await ServiceSlot.findByIdAndDelete(id);

    return res.json({ message: "Service slot deleted successfully" });
  } catch (error) {
    console.error("Error deleting service slot:", error);
    return res.status(500).json({ error: "Failed to delete service slot" });
  }
}
