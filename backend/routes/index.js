import express from "express";
import auth from "../middleware/auth.js";
import { login, signup } from "../controllers/authController.js";
import { startConversation } from "../controllers/conversationController.js";
import { chat } from "../controllers/chatController.js";
import { 
  getAllCustomers, 
  getCustomerById, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer 
} from "../controllers/customerController.js";
import { 
  getAllVehicles, 
  getVehicleById, 
  createVehicle, 
  updateVehicle, 
  deleteVehicle 
} from "../controllers/vehicleController.js";
import { 
  getAllServiceSlots, 
  getAvailableSlots, 
  createServiceSlot, 
  createBulkServiceSlots, 
  updateServiceSlot, 
  deleteServiceSlot 
} from "../controllers/serviceSlotController.js";

const router = express.Router();

// Auth routes
router.post("/auth/login", login);
router.post("/auth/signup", signup);

// Chat routes
router.post("/conversations/start", auth, startConversation);
router.post("/chat", auth, chat);

// Customer routes
router.get("/customers", auth, getAllCustomers);
router.get("/customers/:id", auth, getCustomerById);
router.post("/customers", auth, createCustomer);
router.put("/customers/:id", auth, updateCustomer);
router.delete("/customers/:id", auth, deleteCustomer);

// Vehicle routes
router.get("/vehicles", auth, getAllVehicles);
router.get("/vehicles/:id", auth, getVehicleById);
router.post("/vehicles", auth, createVehicle);
router.put("/vehicles/:id", auth, updateVehicle);
router.delete("/vehicles/:id", auth, deleteVehicle);

// Service slot routes
router.get("/service-slots", auth, getAllServiceSlots);
router.get("/service-slots/available", auth, getAvailableSlots);
router.post("/service-slots", auth, createServiceSlot);
router.post("/service-slots/bulk", auth, createBulkServiceSlots);
router.put("/service-slots/:id", auth, updateServiceSlot);
router.delete("/service-slots/:id", auth, deleteServiceSlot);

export default router;
