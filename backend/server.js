import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";
import { seedServiceSlots } from "./utils/seedServiceSlots.js";
import { seedCustomersAndVehicles } from "./utils/seedCustomersAndVehicles.js";

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  // seed dummy data if DB is empty
  await seedCustomersAndVehicles();
  await seedServiceSlots();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
