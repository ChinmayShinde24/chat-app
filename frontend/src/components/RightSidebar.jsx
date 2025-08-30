import React, { useEffect, useState } from "react";
import assets, { imagesDummyData } from "../assets/assets";
import { useContext } from "react";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";

const RightSidebar = ({ isOpen, onClose }) => {
  const { selectedUser, message } = useContext(ChatContext);
  const { logout, onlineUser } = useContext(AuthContext);
  const [msgImages, setMsgImages] = useState([]);

  // Get all images from messages
  useEffect(() => {
    setMsgImages(message.filter((msg) => msg.image).map((msg) => msg.image));
  }, [message]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && window.innerWidth < 768) {
        const sidebar = document.querySelector(".right-sidebar");
        if (sidebar && !sidebar.contains(e.target)) {
          onClose();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!selectedUser) return null;

  return (
    <aside
      className={`right-sidebar fixed md:static inset-y-0 right-0 w-100 bg-[#1e1e2d] text-white transition-transform duration-300 ease-in-out z-40 overflow-y-auto h-full ${
        isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
      } md:block`}
    >
      {/* Close button for mobile */}
      <button
        onClick={onClose}
        className="md:hidden absolute top-4 right-4 text-gray-300 hover:text-white focus:outline-none"
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

      <div className="pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto px-4">
        <img
          src={selectedUser?.profilePic || assets.avatar_icon}
          alt=""
          className="w-20 aspect-[1/1] rounded-full object-cover"
        />
        <h1 className="px-10 text-xl font-medium mx-auto flex items-center gap-2">
          {onlineUser.includes(selectedUser._id) && (
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
          )}
          {selectedUser.fullName}
        </h1>
        {selectedUser.bio && (
          <p className="px-8 mx-auto text-center text-gray-300">
            {selectedUser.bio}
          </p>
        )}
      </div>

      <hr className="border-[#ffffff20] my-4" />

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

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#1e1e2d] border-t border-gray-700">
        <button
          onClick={() => logout()}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default RightSidebar;
