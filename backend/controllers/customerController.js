import Customer from "../models/Customer.js";
import Vehicle from "../models/Vehicle.js";
import Appointment from "../models/Appointment.js";

/**
 * Get all customers with pagination
 */
export async function getAllCustomers(req, res) {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    
    const query = search 
      ? { 
          $or: [
            { name: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } }
          ]
        }
      : {};

    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Customer.countDocuments(query);

    return res.json({
      customers,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return res.status(500).json({ error: "Failed to fetch customers" });
  }
}

/**
 * Get customer by ID with related data
 */
export async function getCustomerById(req, res) {
  try {
    const { id } = req.params;
    
    const customer = await Customer.findById(id).lean();
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Get related vehicles
    const vehicles = await Vehicle.find({ customerId: id }).lean();
    
    // Get related appointments
    const appointments = await Appointment.find({ customerId: id })
      .sort({ date: -1 })
      .populate("vehicleId")
      .lean();

    return res.json({
      customer,
      vehicles,
      appointments
    });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return res.status(500).json({ error: "Failed to fetch customer" });
  }
}

/**
 * Create a new customer
 */
export async function createCustomer(req, res) {
  try {
    const { name, phone, dlLast4 } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: "Name and phone are required" });
    }

    // Check if phone already exists
    const existing = await Customer.findOne({ phone });
    if (existing) {
      return res.status(400).json({ error: "Customer with this phone already exists" });
    }

    const customer = await Customer.create({
      name,
      phone,
      dlLast4,
      createdAt: new Date()
    });

    return res.status(201).json({ customer });
  } catch (error) {
    console.error("Error creating customer:", error);
    return res.status(500).json({ error: "Failed to create customer" });
  }
}

/**
 * Update customer
 */
export async function updateCustomer(req, res) {
  try {
    const { id } = req.params;
    const { name, phone, dlLast4 } = req.body;

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Check if phone is being changed and if it already exists
    if (phone && phone !== customer.phone) {
      const existing = await Customer.findOne({ phone });
      if (existing) {
        return res.status(400).json({ error: "Phone number already in use" });
      }
    }

    if (name) customer.name = name;
    if (phone) customer.phone = phone;
    if (dlLast4 !== undefined) customer.dlLast4 = dlLast4;

    await customer.save();

    return res.json({ customer });
  } catch (error) {
    console.error("Error updating customer:", error);
    return res.status(500).json({ error: "Failed to update customer" });
  }
}

/**
 * Delete customer (soft delete - only if no related data)
 */
export async function deleteCustomer(req, res) {
  try {
    const { id } = req.params;

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Check for related data
    const vehicleCount = await Vehicle.countDocuments({ customerId: id });
    const appointmentCount = await Appointment.countDocuments({ customerId: id });

    if (vehicleCount > 0 || appointmentCount > 0) {
      return res.status(400).json({ 
        error: "Cannot delete customer with existing vehicles or appointments",
        details: { vehicleCount, appointmentCount }
      });
    }

    await Customer.findByIdAndDelete(id);

    return res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return res.status(500).json({ error: "Failed to delete customer" });
  }
}
