import { Message } from "../models/Message.model.js";
import User from "../models/Users.model.js";
import { Group } from "../models/Group.model.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

//get all users except logged in user
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select(
      "-password"
    );

    //Count num of msg not seen
    const unseenMessages = {};
    const promises = filteredUsers.map(async (user) => {
      const messages = await Message.find({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      });
      if (messages.length > 0) {
        unseenMessages[user._id] = messages.length;
      }
    });
    await Promise.all(promises);
    res.json({ success: true, users: filteredUsers, unseenMessages });
  } catch (err) {
    console.log("Error in get all users", err);
    res.json({ success: false, message: err.message });
  }
};

//Get all mesg for selecetd user
export const getMessage = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    });
    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId },
      { seen: true }
    );
    res.json({ success: true, messages });

  } catch (err) {
    console.log("Error in all msg ", err);
    res.json({ success: false, message: err.messages });
  }
};

//Mark msg as seen
export const marksMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params; // messageId
    const message = await Message.findById(id);

    if (!message) return res.status(404).json({ success: false, message: "Message not found" });

    if (message.status !== "read") {
      message.status = "read";
      message.readAt = new Date();
      await message.save();
    }

    res.json({ success: true, message: "Message marked as read", data: message });
  } catch (err) {
    console.error("Error in markAsRead:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

//Send msg to selecetd user
export const sendMessage = async (req, res) => {
  try {
    const { text, image, replyTo } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;
    
    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      replyTo: replyTo || null
    });

    //Emit new msg to the receiver socket
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    res.json({ success: true, newMessage });
  } catch (err) {
    console.log("Error in sending a message :", err);
    res.json({ success: false, message: err.message });
  }
};

export const deleteForMe = async(req,res) => {
  try{

    const {id} = req.params
    const userId = req.user._id

    const message = await Message.findById(id)
    if (!message) return res.status(404).json({success:false,message:'Message not found'})

    if(!message.deletedBy.includes(userId)){
      message.deletedBy.push(userId)
      await message.save()
    }

    res.json({success:true, message:'Message deleted for you'})

  }catch(error){
    console.log('Error while deleting the message : ', error)
    return res.send({success:false, message:error.message})
  }
}

export const deleteForAll = async(req,res) => {
  try{

    const {id} = req.params
    const userId = req.user._id

    const message = await Message.findById(id)
    if(!message) return res.json({status:404, message:'Message does not exist'})

    // Check if user is the sender of the message
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'You can only delete your own messages' })
    }

    message.text = 'This message is deleted'
    message.image = null
    message.deletedForAll = true
    await message.save()

    // Check if it's a group message or individual message
    if (message.groupId) {
      // Group message - emit to all group members
      const group = await Group.findById(message.groupId).select('members')
      if (group) {
        group.members.forEach(memberId => {
          const memberSocketId = userSocketMap[memberId.toString()]
          if (memberSocketId) {
            io.to(memberSocketId).emit("messageDeletedForAll", message);
          }
        })
      }
    } else {
      // Individual message - emit to sender and receiver
      const receiverId = message.receiverId
      const senderSocketId = userSocketMap[message.senderId.toString()]
      const receiverSocketId = userSocketMap[receiverId.toString()]

      if (senderSocketId) io.to(senderSocketId).emit("messageDeletedForAll", message);
      if (receiverSocketId) io.to(receiverSocketId).emit("messageDeletedForAll", message);
    }

    res.json({success:true,message:'Message deleted for everyone', data:message})

  }catch(error){
    console.log('Error while deleting the message from all users :', error)
    return res.json({success:false, message:error.message})
  }
}

export const markAsDelivered = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findById(id);

    if (!message) return res.status(404).json({ success: false, message: "Message not found" });

    if (message.status === "sent") {
      message.status = "delivered";
      message.deliveredAt = new Date();
      await message.save();
    }

    res.json({ success: true, message: "Message marked as delivered", data: message });
  } catch (err) {
    console.error("Error in markAsDelivered:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};