import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation" },
  sender: String, // user | bot
  text: String,
  timestamp: Date
});

export default mongoose.model("Message", messageSchema);
