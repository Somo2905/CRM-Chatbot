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
