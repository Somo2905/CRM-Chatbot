import Vehicle from "../models/Vehicle.js";
import Customer from "../models/Customer.js";
import Appointment from "../models/Appointment.js";

/**
 * Get all vehicles with pagination
 */
export async function getAllVehicles(req, res) {
  try {
    const { page = 1, limit = 10, search = "", customerId } = req.query;
    
    let query = {};
    
    if (customerId) {
      query.customerId = customerId;
    }
    
    if (search) {
      query.model = { $regex: search, $options: "i" };
    }

    const vehicles = await Vehicle.find(query)
      .populate("customerId", "name phone")
      .sort({ lastServiceDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Vehicle.countDocuments(query);

    return res.json({
      vehicles,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return res.status(500).json({ error: "Failed to fetch vehicles" });
  }
}

/**
 * Get vehicle by ID
 */
export async function getVehicleById(req, res) {
  try {
    const { id } = req.params;
    
    const vehicle = await Vehicle.findById(id)
      .populate("customerId", "name phone dlLast4")
      .lean();
      
    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    // Get service history (appointments)
    const appointments = await Appointment.find({ vehicleId: id })
      .sort({ date: -1 })
      .lean();

    return res.json({
      vehicle,
      serviceHistory: appointments
    });
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    return res.status(500).json({ error: "Failed to fetch vehicle" });
  }
}

/**
 * Create a new vehicle
 */
export async function createVehicle(req, res) {
  try {
    const { customerId, model, make, year, lastServiceDate, warrantyEndDate } = req.body;

    if (!customerId || !model) {
      return res.status(400).json({ error: "Customer ID and model are required" });
    }

    // Verify customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const vehicle = await Vehicle.create({
      customerId,
      model,
      make,
      year,
      lastServiceDate: lastServiceDate ? new Date(lastServiceDate) : null,
      warrantyEndDate: warrantyEndDate ? new Date(warrantyEndDate) : null
    });

    return res.status(201).json({ vehicle });
  } catch (error) {
    console.error("Error creating vehicle:", error);
    return res.status(500).json({ error: "Failed to create vehicle" });
  }
}

/**
 * Update vehicle
 */
export async function updateVehicle(req, res) {
  try {
    const { id } = req.params;
    const { model, make, year, lastServiceDate, warrantyEndDate } = req.body;

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    if (model) vehicle.model = model;
    if (make) vehicle.make = make;
    if (year) vehicle.year = year;
    if (lastServiceDate !== undefined) {
      vehicle.lastServiceDate = lastServiceDate ? new Date(lastServiceDate) : null;
    }
    if (warrantyEndDate !== undefined) {
      vehicle.warrantyEndDate = warrantyEndDate ? new Date(warrantyEndDate) : null;
    }

    await vehicle.save();

    return res.json({ vehicle });
  } catch (error) {
    console.error("Error updating vehicle:", error);
    return res.status(500).json({ error: "Failed to update vehicle" });
  }
}

/**
 * Delete vehicle
 */
export async function deleteVehicle(req, res) {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    // Check for related appointments
    const appointmentCount = await Appointment.countDocuments({ vehicleId: id });
    if (appointmentCount > 0) {
      return res.status(400).json({ 
        error: "Cannot delete vehicle with existing appointments",
        details: { appointmentCount }
      });
    }

    await Vehicle.findByIdAndDelete(id);

    return res.json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    return res.status(500).json({ error: "Failed to delete vehicle" });
  }
}
