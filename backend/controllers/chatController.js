import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Vehicle from "../models/Vehicle.js";
import Customer from "../models/Customer.js";
import Appointment from "../models/Appointment.js";
import ServiceSlot from "../models/ServiceSlot.js";
import { queryRag } from "../services/ragService.js";
import { bookService } from "./appointmentController.js";

/**
 * Enhanced intent detection
 * (LLM must NEVER decide actions)
 */
function detectIntent(text) {
  const msg = text.toLowerCase();

  if (
    msg.includes("book") ||
    msg.includes("schedule") ||
    msg.includes("appointment")
  ) {
    return "BOOK_SERVICE";
  }

  if (
    msg.includes("search") && (msg.includes("vehicle") || msg.includes("car"))
  ) {
    return "SEARCH_VEHICLES";
  }

  if (
    msg.includes("my vehicle") ||
    msg.includes("my car") ||
    msg.includes("vehicle info") ||
    msg.includes("vehicle detail")
  ) {
    return "VEHICLE_INFO";
  }

  if (
    msg.includes("appointment") && (msg.includes("status") || msg.includes("check") || msg.includes("history"))
  ) {
    return "APPOINTMENT_INFO";
  }

  if (
    msg.includes("available") && (msg.includes("slot") || msg.includes("time"))
  ) {
    return "AVAILABLE_SLOTS";
  }

  if (
    msg.includes("my info") ||
    msg.includes("profile") ||
    msg.includes("customer info")
  ) {
    return "CUSTOMER_INFO";
  }

  return "INFO";
}

export async function chat(req, res) {
  try {
    const customerId = req.user.customerId;
    const { conversationId, message } = req.body;

    console.log("Chat endpoint - customerId:", customerId, "conversationId:", conversationId);

    // 1️⃣ Validate input
    if (!conversationId || !message) {
      return res.status(400).json({ error: "Invalid request" });
    }

    // 2️⃣ Validate conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      customerId,
      status: "active"
    });

    if (!conversation) {
      console.log("Conversation not found for:", { conversationId, customerId });
      // Try to find any conversation with this ID to debug
      const allConversations = await Conversation.find({ _id: conversationId });
      console.log("All conversations with this ID:", allConversations);
      
      return res.status(400).json({
        error: "Conversation closed or invalid"
      });
    }

    // 3️⃣ Store user message
    await Message.create({
      conversationId,
      sender: "user",
      text: message,
      timestamp: new Date()
    });

    conversation.lastMessageAt = new Date();
    await conversation.save();

  // 4️⃣ Detect intent and gather context
  const intent = detectIntent(message);
  
  let additionalContext = "";
  let responseType = "RAG";
  let data = null;

  // =========================
  // 🛠 ACTION PATH — BOOK SERVICE
  // =========================
  if (intent === "BOOK_SERVICE") {
    // For now, preferred date is tomorrow (can be extracted later)
    const preferredDate = new Date();
    preferredDate.setDate(preferredDate.getDate() + 1); // tomorrow

    const result = await bookService({
      customerId,
      preferredDate
    });

    if (!result.success) {
      additionalContext = `BOOKING_FAILED: No service slots available for date ${preferredDate.toDateString()}. The user requested a service appointment but no slots were available.`;
    } else {
      additionalContext = `BOOKING_SUCCESS: Service appointment booked successfully. Date: ${result.appointment.date.toDateString()}, Time: ${result.appointment.time}, Appointment ID: ${result.appointment._id}. Confirm this booking to the user in a friendly way.`;
      responseType = "ACTION";
      data = {
        appointmentId: result.appointment._id,
        date: result.appointment.date,
        time: result.appointment.time
      };
    }
  }

  // =========================
  // 🔍 SEARCH VEHICLES
  // =========================
  else if (intent === "SEARCH_VEHICLES") {
    const vehicles = await Vehicle.find({ customerId }).populate("customerId", "name");
    
    if (vehicles.length > 0) {
      const vehicleDetails = vehicles.map(v => 
        `${v.make || ''} ${v.model} ${v.year ? `(${v.year})` : ''} - Last Service: ${v.lastServiceDate ? new Date(v.lastServiceDate).toLocaleDateString() : 'Never'}, Warranty Ends: ${v.warrantyEndDate ? new Date(v.warrantyEndDate).toLocaleDateString() : 'N/A'}`
      ).join("; ");
      
      additionalContext = `VEHICLE_SEARCH: The user has ${vehicles.length} vehicle(s) registered: ${vehicleDetails}. Provide this information in a friendly, conversational way.`;
      data = { vehicles: vehicles.map(v => ({ id: v._id, make: v.make, model: v.model, year: v.year })) };
    } else {
      additionalContext = `VEHICLE_SEARCH: No vehicles found for this customer. Suggest they add a vehicle through the vehicle management page.`;
    }
  }

  // =========================
  // 🚗 VEHICLE INFO
  // =========================
  else if (intent === "VEHICLE_INFO") {
    const vehicles = await Vehicle.find({ customerId });
    
    if (vehicles.length > 0) {
      const vehicleDetails = vehicles.map(v => 
        `${v.make || ''} ${v.model} ${v.year ? `(${v.year})` : ''}: Last serviced on ${v.lastServiceDate ? new Date(v.lastServiceDate).toLocaleDateString() : 'Never'}. Warranty ${v.warrantyEndDate ? (new Date(v.warrantyEndDate) > new Date() ? `valid until ${new Date(v.warrantyEndDate).toLocaleDateString()}` : 'expired') : 'information not available'}`
      ).join("; ");
      
      additionalContext = `VEHICLE_INFO: Customer's vehicle details: ${vehicleDetails}. Present this information clearly and offer help with service scheduling if needed.`;
      data = { vehicles };
    } else {
      additionalContext = `VEHICLE_INFO: No vehicles registered for this customer yet.`;
    }
  }

  // =========================
  // 📅 APPOINTMENT INFO
  // =========================
  else if (intent === "APPOINTMENT_INFO") {
    const appointments = await Appointment.find({ customerId })
      .populate("vehicleId")
      .sort({ date: -1 })
      .limit(5);
    
    if (appointments.length > 0) {
      const appointmentDetails = appointments.map(a => 
        `${a.status} appointment on ${new Date(a.date).toLocaleDateString()} at ${a.time} for ${a.vehicleId?.model || 'vehicle'}`
      ).join("; ");
      
      additionalContext = `APPOINTMENT_INFO: Customer has ${appointments.length} appointment(s): ${appointmentDetails}. Present this information clearly.`;
      data = { appointments };
    } else {
      additionalContext = `APPOINTMENT_INFO: No appointments found for this customer. Offer to schedule a service appointment.`;
    }
  }

  // =========================
  // 🕐 AVAILABLE SLOTS
  // =========================
  else if (intent === "AVAILABLE_SLOTS") {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const nextWeek = new Date(tomorrow);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const slots = await ServiceSlot.find({
      date: { $gte: tomorrow, $lte: nextWeek },
      isActive: true,
      $expr: { $lt: ["$bookedCount", "$capacity"] }
    }).sort({ date: 1, time: 1 }).limit(10);
    
    if (slots.length > 0) {
      const slotDetails = slots.map(s => 
        `${new Date(s.date).toLocaleDateString()} at ${s.time} (${s.capacity - s.bookedCount} spots available)`
      ).join("; ");
      
      additionalContext = `AVAILABLE_SLOTS: Found ${slots.length} available slot(s) in the next week: ${slotDetails}. Present these options and offer to book.`;
      data = { slots };
    } else {
      additionalContext = `AVAILABLE_SLOTS: No available slots in the next week. Suggest checking back later or calling for availability.`;
    }
  }

  // =========================
  // 👤 CUSTOMER INFO
  // =========================
  else if (intent === "CUSTOMER_INFO") {
    const customer = await Customer.findById(customerId);
    
    if (customer) {
      additionalContext = `CUSTOMER_INFO: Customer name is ${customer.name}, phone: ${customer.phone}, joined on ${new Date(customer.createdAt).toLocaleDateString()}. Present this information in a friendly way.`;
      data = { customer: { name: customer.name, phone: customer.phone, createdAt: customer.createdAt } };
    }
  }

  // =========================
  // 🧠 Get vehicle context for all paths
  // =========================
  const vehicle = await Vehicle.findOne({ customerId });
  
  // =========================
  // 🤖 Send to Python Backend for Response Generation
  // =========================
  const ragResponse = await queryRag({
    query: message,
    session_id: conversationId,
    user_data: {
      customerId,
      vehicleModel: vehicle?.model,
      vehicleMake: vehicle?.make,
      vehicleYear: vehicle?.year,
      dealerId: "D001"
    },
    additional_context: additionalContext
  });

  const reply = ragResponse.response || ragResponse.answer;
  
  // Merge sources from RAG if available
  if (ragResponse.sources) {
    data = { ...data, sources: ragResponse.sources };
  }

  // 5️⃣ Store bot reply
  await Message.create({
    conversationId,
    sender: "bot",
    text: reply,
    timestamp: new Date()
  });

  // 6️⃣ Respond
  return res.json({
    type: responseType,
    reply,
    data
  });
  } catch (error) {
    console.error("Chat error:", error);
    return res.status(500).json({ 
      error: "An error occurred while processing your message. Please try again." 
    });
  }
}
