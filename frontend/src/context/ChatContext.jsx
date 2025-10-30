import { createContext, useContext, useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import toast from 'react-hot-toast';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [message, setMessage] = useState(() => []);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  //State to get the group
  const [groups, setGroups] = useState([])

  const { socket, axios, authUser } = useContext(AuthContext);

  //function to get all the users from sidebar

  const getUsers = async () => {
    if (!authUser) return;

    try {
      const { data } = await axios.get('api/messages/users');
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
      }
    } catch (err) {
      console.log('Error while getting user in side bar : ', err);
      toast.error(err.message);
    }
  };

  //Function to get messages from selected users

  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`api/messages/${userId}`);
      if (data.success) {
        setMessage(data.messages);
      }
    } catch (err) {
      console.log('Error while getting messages : ', err);
      toast.error(err.message);
    }
  };

  //Function to get group messages
  const getGroupMessages = async (groupId) => {
    try {
      const { data } = await axios.get(`/api/group/${groupId}/messages`);
      if (data.success) {
        setMessage(data.messages);
      }
    } catch (err) {
      console.log('Error while getting group messages : ', err);
      toast.error(err.message);
    }
  };

  //Function to send the message to the user

  const sendMessage = async (messageData) => {
    if (!authUser || !selectedUser) return;

    try {
      const { data } = await axios.post(
        `api/messages/send/${selectedUser._id}`,
        messageData,
      );
      if (data.success) {
        setMessage((prevMessages) => {
          const currentMessages = Array.isArray(prevMessages)
            ? prevMessages
            : [];
          return [...currentMessages, data.newMessage];
        });
      }
    } catch (err) {
      console.log('Error while sending message : ', err);
      toast.error(err.message);
    }
  };

  //Function to subscribe selected user

  const subscribeToMessages = async () => {
    if (!socket) return;

    socket.on('newMessage', (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true;
        setMessage((prevMessage) => [...prevMessage, newMessage]); // fixed
        axios.put(`api/messages/mark/${newMessage._id}`);
      } else {
        setUnseenMessages((prevUnseenMessages) => ({
          ...prevUnseenMessages,
          [newMessage.senderId]: prevUnseenMessages[newMessage.senderId]
            ? prevUnseenMessages[newMessage.senderId] + 1
            : 1,
        }));
      }
    });
  };

  //Function to unsubscribe from messages
  const unSubscribeFromMessage = () => {
    if (socket) {
      socket.off('newMessage');
    }
  };

  useEffect(() => {
    if (authUser) {
      subscribeToMessages();
      return () => unSubscribeFromMessage();
    }
  }, [socket, selectedUser, authUser]);

  //delete for me 
  const deleteMessageForMe = async (messageId) => {
    try {
      const { data } = await axios.delete(`api/messages/delete/me/${messageId}`);
      console.log('Data while deleting the message: ', data);
      if (data.success) {
        setMessage((prev) => prev.filter((msg) => msg._id !== messageId));
        return { success: true };
      }
    } catch (error) {
      console.error('Error deleting message for me:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete message');
    }
  };

  // Delete for everyone
  useEffect(() => {
    if (!socket || !authUser) return;
  
    socket.on("messageDeletedForAll", (deletedMessage) => {
      setMessage((prev) =>
        prev.map((msg) =>
          msg._id === deletedMessage._id
            ? { ...msg, text: "This message is deleted", image: null }
            : msg
        )
      );
    });
  
    // Cleanup listener on unmount
    return () => {
      socket.off("messageDeletedForAll");
    };
  }, [socket, authUser]);
 
  const deleteMessageForAll = async (messageId) => {
    try {
      const { data } = await axios.delete(`api/messages/delete/all/${messageId}`);
      if (data.success) {
        // Don't update local state here - socket will handle real-time updates for all users
        toast.success('Message deleted for everyone');
        return { success: true };
      }
    } catch (error) {
      console.error('Error deleting message for all:', error);
      toast.error(error.response?.data?.message || 'Failed to delete message for everyone');
      throw new Error(error.response?.data?.message || 'Failed to delete message for everyone');
    }
  };

  //get user group
  const getGroups = async() => {
    if (!authUser) return;

    try{
      const {data} = await axios.get('/api/group')
      if(data.success){
        setGroups(data.groups)
      } else {
        toast.error(data.message || "Failed to fetch group")
      }

    }catch(error){
      console.log('Error to fetch group name :',message.error)
      toast.error(error.response?.data?.message || error.message)
    }
  }

  useEffect(()=>{
    if (authUser) {
      getUsers();
      getGroups();
    }
  },[authUser])

  //send message in group
  const sendGroupMessage = async (messageData) => {
    if (!authUser || !selectedGroup) return;

    try {
      const group = groups.find(g => g._id === selectedGroup._id);
      const { data } = await axios.post("/api/group/send-message", { 
        groupId: selectedGroup._id, 
        text: messageData.text,
        image: messageData.image 
      });

      if (data.success) {
        // Don't add to local state - socket will handle real-time updates for all users including sender
        // setMessage((prevMessages) => {
        //   const currentMessages = Array.isArray(prevMessages) ? prevMessages : [];
        //   return [...currentMessages, data.message];
        // });

        // emit socket event
        socket.emit("sendGroupMessage", {
          groupId: selectedGroup._id,
          message: data.message,
          members: group.members.map(m => m._id)
        });
      }
    } catch (err) {
      console.log('Error while sending group message : ', err);
      toast.error(err.message);
    }
  };

// subscribe to group messages
useEffect(() => {
  if (!socket || !authUser) return;

  const handleGroupMessage = ({ groupId, message }) => {
    // If we're currently viewing this group, add message to current messages
    if (selectedGroup && selectedGroup._id === groupId) {
      setMessage((prevMessages) => {
        // Check if message already exists (to prevent duplicates)
        const messageExists = prevMessages.some(existingMsg => existingMsg._id === message._id);
        if (messageExists) {
          return prevMessages;
        }
        return [...prevMessages, message];
      });
    }

    // Also update the groups state for sidebar notifications
    setGroups(prevGroups => prevGroups.map(g => g._id === groupId
      ? {
          ...g,
          messages: (() => {
            // Check if message already exists in groups state
            const existingMessages = g.messages || [];
            const messageExists = existingMessages.some(existingMsg => existingMsg._id === message._id);
            if (messageExists) {
              return existingMessages;
            }
            return [...existingMessages, message];
          })()
        }
      : g));
  };

  socket.on("group:message", handleGroupMessage);

  return () => socket.off("group:message", handleGroupMessage);
}, [socket, selectedGroup, authUser]);

 //Add user in group
const addMemberToGroup = async (groupId, userId) => {
  try {
    const { data } = await axios.patch(`/api/group/${groupId}/add-member`, { userId });
    toast.success("Member added successfully!");
    // refresh group in state if needed
    setGroups(prev => prev.map(g => g._id === data.group._id ? data.group : g));
    return data.group;
  } catch (err) {
    if (err.response?.status === 400) {
      toast.error(err.response.data.message || "User already exists in this group");
    } else {
      toast.error("Only admin can add");
    }
  }
};

 //Remove user
 const removeUserFromGroup = async (groupId, userId) => {
  try{
    const {data} = await axios.put(`/api/group/${groupId}/remove-member`,{userId})
    toast.success('Member removed sucessfully')
    setGroups(prev => prev.map(g => g._id === data.group._id ? data.group : g))
  }catch(err){
    if (err.response?.status === 400) {
      toast.error(err.response.data.message || "User already exists in this group");
    } else {
      toast.error("Only admin can remove");
    }
  }
 }

  const value = {
    message,
    users,
    selectedUser,
    selectedGroup,
    getUsers,
    getMessages,
    getGroupMessages,
    sendMessage,
    sendGroupMessage,
    setSelectedUser,
    setSelectedGroup,
    unseenMessages,
    setUnseenMessages,
    deleteMessageForMe,
    deleteMessageForAll,
    groups,
    setGroups,
    addMemberToGroup,
    removeUserFromGroup
  };
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
