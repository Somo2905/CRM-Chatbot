import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Vehicle from "../models/Vehicle.js";
import { queryRag } from "../services/ragService.js";
import { bookService } from "./appointmentController.js";

/**
 * Simple deterministic intent detection
 * (LLM must NEVER decide actions)
 */
function detectIntent(text) {
  const msg = text.toLowerCase();

  if (
    msg.includes("book") ||
    msg.includes("schedule") ||
    msg.includes("service")
  ) {
    return "BOOK_SERVICE";
  }

  return "INFO";
}

export async function chat(req, res) {
  const customerId = req.user.customerId;
  const { conversationId, message } = req.body;

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

  // 4️⃣ Detect intent
  const intent = detectIntent(message);

  let reply;
  let responseType = "RAG";
  let data = null;

  // =========================
  // 🛠 ACTION PATH — BOOK SERVICE
  // =========================
  if (intent === "BOOK_SERVICE") {
    // For now, preferred date is assumed (can be extracted later)
    const preferredDate = new Date("2026-01-10");

    const result = await bookService({
      customerId,
      preferredDate
    });

    if (!result.success) {
      reply =
        "❌ No service slots are available for the selected date. Please choose another day.";
    } else {
      reply = `✅ Your service has been booked for ${result.appointment.date.toDateString()} at ${result.appointment.time}.`;
      responseType = "ACTION";
      data = {
        appointmentId: result.appointment._id
      };
    }
  }

  // =========================
  // 🧠 RAG PATH — INFORMATIONAL QUERY
  // =========================
  else {
    const vehicle = await Vehicle.findOne({ customerId });

    const ragResponse = await queryRag({
      query: message,
      context: {
        vehicleModel: vehicle?.model,
        dealerId: "D001"
      }
    });

    reply = ragResponse.answer;
    data = { sources: ragResponse.sources || [] };
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
}
