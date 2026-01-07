import Customer from "../models/Customer.js";
import Vehicle from "../models/Vehicle.js";

export async function seedCustomersAndVehicles() {
  try {
    // Remove the check that prevents seeding if data exists
    // Now it will always run when called

    // Create dummy customers
    const customers = await Customer.insertMany([
      {
        name: "John Doe",
        phone: "555-0001",
        dlLast4: "1234"
      },
      {
        name: "Jane Smith",
        phone: "555-0002",
        dlLast4: "5678"
      },
      {
        name: "Bob Johnson",
        phone: "555-0003",
        dlLast4: "9012"
      },
      {
        name: "Sarah Williams",
        phone: "555-0004",
        dlLast4: "3456"
      },
      {
        name: "Michael Brown",
        phone: "555-0005",
        dlLast4: "7890"
      },
      {
        name: "Emma Davis",
        phone: "555-0006",
        dlLast4: "2468"
      }
    ]);

    console.log(`Customer seeder: inserted ${customers.length} dummy customers.`);

    // Create dummy vehicles for each customer
    const vehicles = await Vehicle.insertMany([
      {
        customerId: customers[0]._id,
        model: "Honda Civic 2022",
        lastServiceDate: new Date("2025-11-15"),
        warrantyEndDate: new Date("2027-01-07")
      },
      {
        customerId: customers[0]._id,
        model: "Honda CR-V 2020",
        lastServiceDate: new Date("2025-10-01"),
        warrantyEndDate: new Date("2026-10-01")
      },
      {
        customerId: customers[1]._id,
        model: "Toyota Camry 2023",
        lastServiceDate: new Date("2025-12-01"),
        warrantyEndDate: new Date("2027-12-01")
      },
      {
        customerId: customers[1]._id,
        model: "Toyota Corolla 2019",
        lastServiceDate: new Date("2025-09-15"),
        warrantyEndDate: new Date("2026-09-15")
      },
      {
        customerId: customers[2]._id,
        model: "Ford F-150 2021",
        lastServiceDate: new Date("2025-10-20"),
        warrantyEndDate: new Date("2026-10-20")
      },
      {
        customerId: customers[2]._id,
        model: "Ford Mustang 2023",
        lastServiceDate: new Date("2025-11-30"),
        warrantyEndDate: new Date("2027-11-30")
      },
      {
        customerId: customers[3]._id,
        model: "Chevrolet Silverado 2022",
        lastServiceDate: new Date("2025-12-10"),
        warrantyEndDate: new Date("2027-12-10")
      },
      {
        customerId: customers[3]._id,
        model: "Chevrolet Traverse 2021",
        lastServiceDate: new Date("2025-08-20"),
        warrantyEndDate: new Date("2026-08-20")
      },
      {
        customerId: customers[4]._id,
        model: "BMW 3 Series 2024",
        lastServiceDate: new Date("2025-11-05"),
        warrantyEndDate: new Date("2027-11-05")
      },
      {
        customerId: customers[4]._id,
        model: "BMW X5 2022",
        lastServiceDate: new Date("2025-09-25"),
        warrantyEndDate: new Date("2027-09-25")
      },
      {
        customerId: customers[5]._id,
        model: "Mazda CX-5 2023",
        lastServiceDate: new Date("2025-10-15"),
        warrantyEndDate: new Date("2027-10-15")
      },
      {
        customerId: customers[5]._id,
        model: "Mazda 3 2021",
        lastServiceDate: new Date("2025-07-30"),
        warrantyEndDate: new Date("2026-07-30")
      }
    ]);

    console.log(`Vehicle seeder: inserted ${vehicles.length} dummy vehicles.`);
  } catch (err) {
    console.error("Customer/Vehicle seeder error:", err);
  }
}
