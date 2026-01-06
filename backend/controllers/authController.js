import jwt from "jsonwebtoken";
import Customer from "../models/Customer.js";

export async function login(req, res) {
  const { phone, dlLast4 } = req.body;

  const customer = await Customer.findOne({ phone });
  if (!customer || customer.dlLast4 !== dlLast4) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { customerId: customer._id },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({
    token,
    customer: { id: customer._id, name: customer.name }
  });
}

export async function signup(req, res) {
  try {
    const { name, phone, dlLast4 } = req.body;

    if (!name || !phone || !dlLast4) {
      return res.status(400).json({ error: 'name, phone and dlLast4 are required' });
    }

    // Prevent duplicate phone numbers
    const existing = await Customer.findOne({ phone });
    if (existing) {
      return res.status(409).json({ error: 'Customer with this phone already exists' });
    }

    const customer = new Customer({ name, phone, dlLast4 });
    await customer.save();

    const token = jwt.sign(
      { customerId: customer._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      token,
      customer: { id: customer._id, name: customer.name }
    });
  } catch (err) {
    console.error('Signup error', err);
    // handle duplicate key error just in case
    if (err?.code === 11000) {
      return res.status(409).json({ error: 'Customer with this phone already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}


