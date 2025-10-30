import React, { useEffect, useState, useContext } from "react";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import assets from "../assets/assets";
import AddMembers from "./AddMembers";
import { MdPersonAdd } from "react-icons/md";
import RemoveMember from "./RemoveMember";

const RightSidebar = ({ isOpen, onClose, group }) => {
  const { selectedUser, message } = useContext(ChatContext);
  const { authUser, onlineUser } = useContext(AuthContext);
  const [msgImages, setMsgImages] = useState([]);
  const [participants, setParticipants] = useState([]);

  // Get all images from messages
  useEffect(() => {
    setMsgImages(message.filter((msg) => msg.image).map((msg) => msg.image));
  }, [message]);

  // Get current chat (either user or group)
  const currentChat = selectedUser || group;
  const isGroup = !!group;

  // Fetch participants if it's a group
  useEffect(() => {
    const fetchParticipants = async () => {
      if (isGroup && currentChat?.members) {
        setParticipants(currentChat.members.map(member => ({
          ...member,
          isAdmin: member._id === currentChat.groupAdmin
        })));
      } else if (selectedUser?.isGroup && selectedUser?.members) {
        // Fallback for backward compatibility
        setParticipants(selectedUser.members.map(member => ({
          ...member,
          isAdmin: member._id === selectedUser.groupAdmin
        })));
      }
    };

    fetchParticipants();
  }, [currentChat, isGroup, selectedUser]);

  return (
    <aside
      className={`fixed inset-0 bg-[#1e1e2d] text-white transition-all duration-300 ease-in-out z-50 overflow-y-auto ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-300 hover:text-white focus:outline-none p-2"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {currentChat && (
        <div className="pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto px-4">
          {
            isGroup ? (
              currentChat?.groupAvatar ? (
                <img
                  src={currentChat.groupAvatar}
                  alt=""
                  className="w-20 aspect-[1/1] rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
                  {currentChat?.groupName?.charAt(0)?.toUpperCase()}
                </div>
              )
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
                {currentChat?.groupName?.charAt(0)?.toUpperCase()}
              </div>
            )
          }
          <h1 className="px-10 text-xl font-medium mx-auto flex items-center gap-2">
            {!isGroup && currentChat?._id && onlineUser.includes(currentChat._id) && (
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
            )}
            {currentChat?.groupName}
          </h1>
          {currentChat?.bio && (
            <p className="px-8 mx-auto text-center text-gray-300">
              {currentChat.bio}
            </p>
          )}
        </div>
      )}

      {isGroup && currentChat?.members && (
        <div className="w-full max-w-2xl mx-auto mt-6">
          <div className="bg-[#2a2b3c] rounded-xl p-6">
            <div className="flex flex-col items-center mb-6">
              <div className="flex justify-between w-full">
                <h2 className="text-xl font-semibold">Group Members</h2>
                <div className="text-gray-400 text-sm">
                  {participants?.length || 0} {participants?.length === 1 ? 'member' : 'members'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MdPersonAdd />
                <AddMembers group={currentChat}/>
              </div>
            </div>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {participants?.length > 0 ? (
                participants.map((member) => (
                  <div
                    key={member?._id || Math.random()}
                    className="flex items-center justify-between p-3 bg-[#1e1e2d] rounded-lg hover:bg-[#2d2d3d] transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="relative">
                        <img
                          src={member?.profilePic || assets.avatar_icon}
                          alt={member?.fullName || 'User'}
                          className="w-12 h-12 rounded-full object-cover border-2 border-[#3a3b4d]"
                        />
                        {member?._id && onlineUser.includes(member._id) && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1e1e2d]"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2" style={{justifyContent:"space-between"}}>
                          <span className="font-medium truncate">{member?.fullName || 'Unknown User'}</span>
                              {currentChat?.admin?._id === member?._id &&(
                            <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full whitespace-nowrap">
                              Admin
                            </span>
                          )}
                          <div>
                            <RemoveMember member={member} groupId={currentChat._id}/>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400">
                          {member?._id && onlineUser.includes(member._id) ? 'Active now' : 'Offline'}
                        </p>
                      </div>
                    </div>
                    {member?._id === currentChat?.groupAdmin && (
                      <span className="text-xs text-yellow-400">Creator</span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 py-4">No members found</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="px-5 pb-20 text-sm">
        <h3 className="text-gray-400 mb-3">Shared Media</h3>
        {msgImages.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {msgImages.map((url, index) => (
              <div
                key={index}
                onClick={() => window.open(url, "_blank")}
                className="aspect-square cursor-pointer rounded-md overflow-hidden bg-gray-700 hover:opacity-80 transition-opacity"
              >
                <img
                  src={url}
                  alt={`Shared content ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">No media shared yet</p>
        )}
      </div>
    </aside>
  );
};

export default RightSidebar;