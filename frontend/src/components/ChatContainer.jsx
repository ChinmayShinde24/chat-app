import React, { useEffect, useRef, useState } from "react";
import assets, { messagesDummyData } from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { useContext } from "react";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import EmojiPicker from "emoji-picker-react";

const ChatContainer = ({ onToggleRightSidebar }) => {
  const { selectedUser, setSelectedUser, message, sendMessage, getMessages } =
    useContext(ChatContext);
  const { authUser, onlineUser } = useContext(AuthContext);
  const scrollEnd = useRef();
  const [input, setInput] = useState("");
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const isMobile = window.innerWidth < 768; // md breakpoint

  // Toggle right sidebar visibility
  const toggleRightSidebar = () => {
    setShowRightSidebar(!showRightSidebar);
  };

  //Emoji
  const handleEmojiClick = (emoji) => {
    setInput((prev) => prev + emoji.emoji)
    setShowEmojiPicker(false)
  }

  // Handle send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;
    await sendMessage({ text: input.trim() });
    setInput("");
  };

  // Handle image send
  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select an image");
      return;
    }
    const reader = new FileReader();

    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (scrollEnd.current && message) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [message]);

  return selectedUser ? (
    <div className="h-full overflow-hidden relative backdrop-blur-lg flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between py-3 px-4 border-b border-stone-500">
        <div className="flex items-center gap-3">
          <img
            src={selectedUser?.profilePic || assets.avatar_icon}
            alt=""
            className="w-8 h-8 rounded-full object-cover"
          />
          <p className="flex items-center gap-2 text-white text-lg">
            {selectedUser.fullName}
            {onlineUser.includes(selectedUser._id) && (
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <img
            onClick={() => setSelectedUser(null)}
            src={assets.arrow_icon}
            alt="Back"
            className="md:hidden max-w-7"
          />
          <img
            src={assets.help_icon}
            alt="Help"
            className="hidden md:block max-w-5"
          />
        </div>
      </div>

      {/* Chat Body */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6">
        {/* {console.log("authuser", authUser)}, */}
        {Array.isArray(message) && message.length > 0 ? (
          message.map((msg, index) => {
            const isCurrentUser = msg.senderId === authUser._id;
            return (
              <div
                key={index}
                className={`flex items-start gap-2 mb-4 ${
                  isCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                {/* Avatar - Only show for received messages */}
                {!isCurrentUser && (
                  <div className="flex-shrink-0">
                    <img
                      src={selectedUser?.profilePic || assets.avatar_icon}
                      alt=""
                      className="rounded-full w-8 h-8 mt-1"
                    />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`flex flex-col ${
                    isCurrentUser ? "items-end" : "items-start"
                  }`}
                >
                  {msg.image ? (
                    <img
                      src={msg.image}
                      alt=""
                      className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden"
                    />
                  ) : (
                    <p
                      className={`p-3 max-w-[200px] md:text-sm font-light rounded-lg break-all ${
                        isCurrentUser
                          ? "bg-violet-600 text-white rounded-br-none"
                          : "bg-gray-200 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      {msg.text}
                    </p>
                  )}
                  <span className="text-xs text-gray-500 mt-1">
                    {formatMessageTime(msg.createdAt)}
                  </span>
                </div>

                {/* Avatar - Only show for sent messages */}
                {isCurrentUser && (
                  <div className="flex-shrink-0">
                    <img
                      src={authUser?.profilePic || assets.avatar_icon}
                      alt=""
                      className="rounded-full w-8 h-8 mt-1"
                    />
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">
              No messages yet. Start a conversation!
            </p>
          </div>
        )}
        <div ref={scrollEnd}></div>
      </div>

      {/* Bottom area */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#1e1e2d] border-t border-gray-700 p-3">
        <div className="flex items-center gap-3 bg-[#2a2b3c] rounded-full px-4 py-2">
        <div className="flex items-center gap-2 relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="cursor-pointer p-1 hover:bg-gray-600 rounded-full"
            >
              😊
            </button>

            {showEmojiPicker && <EmojiPicker onEmojiClick={handleEmojiClick} />}
          </div>

          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            onKeyDown={(e) => (e.key === "Enter" ? handleSendMessage(e) : null)}
            type="text"
            placeholder="Type your message..."
            className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder-gray-400 w-full"
          />
          <div className="flex items-center gap-2">
            <input
              type="file"
              id="image"
              accept="image/png,image/jpeg"
              onChange={handleSendImage}
              className="hidden"
            />
            <label
              htmlFor="image"
              className="cursor-pointer p-1 hover:bg-gray-600 rounded-full"
            >
              <img
                src={assets.gallery_icon}
                alt="Attach image"
                className="w-5 h-5"
              />
            </label>
            <button
              onClick={handleSendMessage}
              className="bg-violet-600 hover:bg-violet-700 text-white rounded-full w-8 h-8 flex items-center justify-center"
              disabled={!input.trim()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 12h14M12 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
      <img src={assets.logo_icon} alt="" className="max-w-16" />
      <p className="text-lg font-medium text-white">Chat anytime,Anywhere</p>
    </div>
  );
};

export default ChatContainer;
