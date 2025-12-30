import Message from "../models/Message.js";
import User from "../models/User.js";

/**
 * Send a new message
 * POST /api/messages
 */
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, propertyId } = req.body;
    const senderId = req.user._id;

    if (!receiverId || !content) {
      return res.status(400).json({
        success: false,
        message: "Receiver and content are required",
      });
    }

    // Verify the receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content,
      property: propertyId || null,
    });

    // Populate sender info for response
    await message.populate("sender", "name image");
    await message.populate("receiver", "name image");

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};

/**
 * Get unread message count for current user
 * GET /api/messages/unread-count
 */
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Count messages where user is receiver and message is not read
    // For now, we'll count all messages received (you can add a 'read' field later)
    const count = await Message.countDocuments({
      receiver: userId,
      read: { $ne: true },
    });

    res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get unread count",
    });
  }
};

/**
 * Get list of conversations (unique users the current user has chatted with)
 * GET /api/messages/conversations
 */
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all messages where user is sender or receiver
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "name image role")
      .populate("receiver", "name image role")
      .populate("property", "title");

    // Get unique conversation partners with latest message
    const conversationMap = new Map();

    for (const msg of messages) {
      const partnerId =
        msg.sender._id.toString() === userId.toString()
          ? msg.receiver._id.toString()
          : msg.sender._id.toString();

      if (!conversationMap.has(partnerId)) {
        const partner =
          msg.sender._id.toString() === userId.toString()
            ? msg.receiver
            : msg.sender;

        conversationMap.set(partnerId, {
          partner,
          lastMessage: msg,
          property: msg.property,
        });
      }
    }

    const conversations = Array.from(conversationMap.values());

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get conversations",
    });
  }
};

/**
 * Get messages with a specific user
 * GET /api/messages/:userId
 */
export const getMessages = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name image")
      .populate("receiver", "name image")
      .populate("property", "title");

    // Mark all messages from the other user as read
    await Message.updateMany(
      {
        sender: otherUserId,
        receiver: currentUserId,
        read: false,
      },
      { read: true }
    );

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get messages",
    });
  }
};
