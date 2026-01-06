import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    status: { type: String, enum: ["active", "closed"], default: "active" },
    startedAt: Date,
    lastMessageAt: Date,
    endedAt: Date
  });

  
  

export default mongoose.model("Conversation", conversationSchema);
