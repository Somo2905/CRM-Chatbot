import Conversation from "../models/Conversation.js";



export async function startConversation(req, res) {
  const customerId = req.user.customerId;

  // 1. Close any existing active conversation
  await Conversation.updateMany(
    { customerId, status: "active" },
    { status: "closed", endedAt: new Date() }
  );

  // 2. Create new conversation
  const conversation = await Conversation.create({
    customerId,
    status: "active",
    startedAt: new Date(),
    lastMessageAt: new Date()
  });

  res.json({ conversationId: conversation._id });
}

export async function endConversation(req, res) {
  const { conversationId } = req.params;
  const customerId = req.user.customerId;

  await Conversation.updateOne(
    { _id: conversationId, customerId, status: "active" },
    { status: "closed", endedAt: new Date() }
  );

  res.json({ success: true });
}
