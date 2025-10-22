import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import toast from "react-hot-toast";

const GroupModal = ({ onClose }) => {
  const { axios, authUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [groupAvatar, setGroupAvatar] = useState(null);

  // Fetch users for the list
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get("/api/messages/users");
        if (data.success) setUsers(data.users.filter(u => u._id !== authUser._id));
      } catch (error) {
        toast.error("Failed to fetch users");
      }
    };
    fetchUsers();
  }, []);

  // Select / Deselect user
  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setGroupAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Submit group creation
  const handleCreateGroup = async () => {
    if (!groupName.trim()) return toast.error("Group name is required");
    if (selectedUsers.length === 0) return toast.error("Select at least one member");

    try {
      const { data } = await axios.post("/api/group", {
        groupName,
        description,
        members: selectedUsers,
        groupAvatar,
      });

      if (data.success) {
        toast.success("Group created successfully!");
        onClose();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
      <div className="bg-[#2a2b3c] rounded-xl w-[90%] max-w-md p-6 text-white relative">
        <h2 className="text-xl font-semibold mb-4">Create New Group</h2>

        {/* Group Avatar Upload */}
        <div className="flex items-center gap-3 mb-4">
          <label className="cursor-pointer">
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            <div className="w-14 h-14 bg-gray-700 rounded-full flex items-center justify-center">
              {groupAvatar ? (
                <img src={groupAvatar} className="w-14 h-14 rounded-full object-cover" />
              ) : (
                <span>📸</span>
              )}
            </div>
          </label>
          <input
            type="text"
            maxLength="10"
            placeholder="Group name"
            className="flex-1 bg-transparent border-b border-gray-500 outline-none"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </div>

        {/* Description */}
        <textarea
          maxLength="30"
          placeholder="Description"
          className="w-full bg-transparent border border-gray-600 rounded-md p-2 mb-4 resize-none"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* User list */}
        <div className="h-48 overflow-y-auto mb-4 border border-gray-600 rounded-md p-2">
          {users.map((user) => (
            <div
              key={user._id}
              onClick={() => toggleUserSelection(user._id)}
              className={`flex items-center justify-between p-2 cursor-pointer rounded ${
                selectedUsers.includes(user._id)
                  ? "bg-violet-600"
                  : "hover:bg-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <img src={user.profilePic} className="w-8 h-8 rounded-full" />
                <p>{user.fullName}</p>
              </div>
              <input
                type="checkbox"
                checked={selectedUsers.includes(user._id)}
                readOnly
              />
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateGroup}
            className="bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupModal;
