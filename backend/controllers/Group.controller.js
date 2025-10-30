import {Group} from "../models/Group.model.js";
import User from "../models/Users.model.js";
import {Message} from "../models/Message.model.js";
import {v2 as cloudinary} from "cloudinary";
import { io, userSocketMap } from "../server.js";

export const createGroup = async(req,res)=>{
    try {
        const {groupName,description,members} = req.body
        const groupAdmin = req.user._id

        if(!groupName || groupName.length > 20){
            return res.status(400).json({success : false, message : 'Group name is requird max 10 char'})
        }

        if(!members || members.length <= 2){
            return res.status(400).json({success : false, message : "Members should be more then 2"})
        }

        //group dp
        let groupAvatar = null;
        if(req.body.groupAvatar){
            const uploaded  = await cloudinary.uploader.upload(req.body.groupAvatar,{
                folder : "group_avatars"
            });
            groupAvatar = uploaded.secure_url
        }[]

        //Include admin as a member
        const membersId = [...new Set([...members,groupAdmin.toString()])]

        const newGroup = await Group.create({
            groupName,
            description,
            admin : groupAdmin,
            members : membersId,
            groupAvatar
        })

        res.status(201).json({
            success : true,
            message : 'Group created succesfully',
            group : newGroup
        })

    } catch (error) {
        console.log('Error while creating a group : ',error)
        res.status(500).json({success : false, message : error.message})
    }   
}

   export const getUserGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await Group.find({ members: userId })
      .populate("admin", "fullName profilePic")
      .populate("members", "fullName profilePic")
      .sort({ createdAt: -1 });

    if (groups.length === 0) {
      return res.json({ success: true, message: "No groups found", groups: [] });
    }

    return res.json({ success: true, groups });
  } catch (error) {
    console.error("Error fetching user groups:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


 export const addMember = async (req, res) => {
  try {
    const { groupId } = req.params; 
    const { userId } = req.body;    
    const adminId = req.user._id;

    if (!userId) {
      return res.status(400).json({ success: false, message: "userId is required" });
    }

    const group = await Group.findById(groupId);
    if (!group)
      return res.status(404).json({ success: false, message: "Group not found" });

    if (group.admin.toString() !== adminId.toString()) {
      return res.status(403).json({ success: false, message: "Only admin can add members" });
    }

    if (group.members.includes(userId)) {
      return res.status(400).json({ success: false, message: "User already in group" });
    }

    group.members.push(userId);
    await group.save();

    await group.populate("members", "fullName profilePic email");
    res.json({ success: true, message: "Member added successfully", group });
  } catch (error) {
    console.error("Error adding member:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

  
  export const removeMember = async (req, res) => {
    try {
      const {groupId} = req.params
      const {userId} = req.body
      const adminId = req.user._id
  
      const group = await Group.findById(groupId);
      if (!group) return res.status(404).json({ success: false, message: "Group not found" });
  
      if (group.admin.toString() !== adminId.toString()) {
        return res.status(403).json({ success: false, message: "Only admin can remove members" });
      }

      if (!group.members.includes(userId))
      return res.status(400).json({ success: false, message: "User not in group" });
  
      group.members = group.members.filter(
        (id) => id.toString() !== userId.toString()
      );
      await group.save();

      await group.populate("members", "fullName profilePic email");
      res.json({ success: true, message: "Member removed successfully", group });
    } catch (error) {
      console.error("Error removing member:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  };
  

export const sendGroupMessage = async (req, res) => {
  try {
    const { groupId, text, image } = req.body;
    const userId = req.user._id;

    // Handle image upload if present
    let imageUrl = null;
    if (image) {
      const uploadedImage = await cloudinary.uploader.upload(image, {
        folder: "group_messages"
      });
      imageUrl = uploadedImage.secure_url;
    }

    // Save message in DB
    const newMessage = await Message.create({
      senderId: userId,
      text,
      image: imageUrl,
      groupId: groupId,
    });

    // Populate sender info for the response
    await newMessage.populate('senderId', 'fullName profilePic');
    io.to(groupId).emit("group:message", newMessage);
    res.json({ success: true, message: newMessage });
  } catch (err) {
    console.log('Error while sending group message:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    // Check if user is member of the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    if (!group.members.includes(userId)) {
      return res.status(403).json({ success: false, message: "You are not a member of this group" });
    }

    // Get messages for this group
    const messages = await Message.find({ groupId })
      .populate('senderId', 'fullName profilePic')
      .sort({ createdAt: 1 });

    res.json({ success: true, messages });
  } catch (err) {
    console.log('Error while getting group messages:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};