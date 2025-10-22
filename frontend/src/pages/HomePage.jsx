import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import { useContext } from "react";
import { ChatContext } from "../context/ChatContext";

const Homepage = () => {
  const { selectedUser, selectedGroup } = useContext(ChatContext);
  const hasChatOpen = selectedUser || selectedGroup;
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Update mobile state on window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setShowRightSidebar(true);
      } else {
        setShowRightSidebar(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Toggle right sidebar
  const toggleRightSidebar = () => {
    setShowRightSidebar(!showRightSidebar);
  };

  // Close right sidebar
  const closeRightSidebar = () => {
    if (isMobile) {
      setShowRightSidebar(false);
    }
  };

  return (
    <div className="w-full h-screen bg-[#0f0f1a] overflow-hidden">
      <div className="w-full h-full flex">
        {/* Left Sidebar - Always visible */}
        {/* Left Sidebar - Hidden when chat is open on mobile, visible on desktop */}
        <div className={`${hasChatOpen ? 'hidden md:block md:w-1/3 lg:w-1/4' : 'w-full md:w-1/2'}`}>
          <Sidebar />
        </div>

        {/* Chat Container - Takes full width when chat is open */}
        <div className={`${hasChatOpen ? 'w-full md:flex-1' : 'hidden md:block'}`}>
          <ChatContainer onToggleRightSidebar={toggleRightSidebar} />
        </div>

        {/* Right Sidebar - Conditionally rendered */}
        {/* {selectedUser && (
          <div
            className={`${
              isMobile ? "fixed inset-0 z-50" : "relative w-1/3 lg:w-1/4"
            } ${showRightSidebar ? "block" : "hidden md:block"}`}
          >
            <RightSidebar
              isOpen={showRightSidebar}
              onClose={closeRightSidebar}
            />
          </div>
        )} */}
      </div>
    </div>
  );
};

export default Homepage;
