import React, { useEffect, useState } from "react";
import assets from "../assets/assets.js";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import CreateGroup from "./CreateGroup";

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    selectedGroup,
    setSelectedUser,
    setSelectedGroup,
    unseenMessages,
    setUnseenMessages,
    groups,
    setGroups
  } = useContext(ChatContext);
  const navigate = useNavigate();
  const { logout, onlineUser } = useContext(AuthContext);
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState("users"); // 'users' or 'groups'

  const filteredUsers = users.filter((user) =>
    user.fullName.toLowerCase().includes(input.toLowerCase())
  );

  useEffect(() => {
    getUsers();
  }, [onlineUser]);

  return (
    <div className={`bg-[#1E1E2D] h-full w-90 flex flex-col border-r border-gray-800`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Chats</h2>
          <div className="relative">
            <img
              src={assets.menu_icon}
              alt="Menu"
              className="w-5 h-5 cursor-pointer"
            />
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-[#2A2B3A] rounded-lg p-1 mb-4">
          <button
            className={`flex-1 py-1.5 text-sm rounded-md ${
              activeTab === 'users' 
                ? 'bg-[#4F46E5] text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button
            className={`flex-1 py-1.5 text-sm rounded-md ${
              activeTab === 'groups'
                ? 'bg-[#4F46E5] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('groups')}
          >
            Groups
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            className="w-full bg-[#2A2B3A] text-sm text-white rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <img
            src={assets.search_icon}
            alt="Search"
            className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'groups' ? (
          <div className="p-2">
            <div className="flex items-center justify-between mb-3 px-2">
              <h3 className="text-sm font-medium text-gray-400">GROUPS</h3>
              <CreateGroup />
            </div>
            <div className="space-y-1">
              {groups?.map((group) => (
                <div
                  key={group._id}
                  onClick={() => {
                    setSelectedGroup(group);
                    setSelectedUser(null);
                  }}
                  className={`flex items-center p-2 rounded-lg cursor-pointer ${
                    selectedGroup?._id === group._id ? 'bg-[#4F46E5]/10' : 'hover:bg-[#2A2B3A]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-[#4F46E5]/20 flex items-center justify-center mr-3">
                    <span className="text-white font-medium">
                      {(group.name || group.groupName)?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {group.name || group.groupName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {group.members?.length} members
                    </p>
                  </div>
                </div>
              ))}
              {groups?.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No groups yet</p>
              )}
            </div>
          </div>
        ) : (
          <div className="p-2">
            <h3 className="text-sm font-medium text-gray-400 mb-3 px-2">DIRECT MESSAGES</h3>
            <div className="space-y-1">
              {filteredUsers.map((user, index) => (
                <div
                  key={user._id || index}
                  onClick={() => {
                    setSelectedUser(user);
                    setSelectedGroup(null);
                    setUnseenMessages((prev) => ({ ...prev, [user._id]: 0 }));
                  }}
                  className={`flex items-center p-2 rounded-lg cursor-pointer ${
                    selectedUser?._id === user._id ? 'bg-[#4F46E5]/10' : 'hover:bg-[#2A2B3A]'
                  }`}
                >
                  <div className="relative mr-3">
                    <img
                      src={user?.profilePic || assets.avatar_icon}
                      alt={user.fullName}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    {onlineUser.includes(user._id) && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1E1E2D]"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white truncate">
                        {user.fullName}
                      </p>
                      {unseenMessages[user._id] > 0 && (
                        <span className="bg-[#4F46E5] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {unseenMessages[user._id]}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {onlineUser.includes(user._id) ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
