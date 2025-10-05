import { createContext, useContext, useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import toast from 'react-hot-toast';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [message, setMessage] = useState(() => []);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, axios } = useContext(AuthContext);

  //function to get all the users from sidebar

  const getUsers = async () => {
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

  //Function to send the message to the user

  const sendMessage = async (messageData) => {
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
    subscribeToMessages();
    return () => unSubscribeFromMessage();
  }, [socket, selectedUser]);

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
    if (!socket) return;
  
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
  }, [socket]);
 
  const deleteMessageForAll = async (messageId) => {
    try {
      const { data } = await axios.delete(`api/messages/delete/all/${messageId}`);
      console.log('Data while deleting message for all:', data);
      if (data.success) {
        setMessage((prev) => 
          prev.map((msg) => 
            msg._id === messageId 
              ? { ...msg, text: 'This message has been deleted', image: null, isDeleted: true }
              : msg
          )
        );
        return { success: true };
      }
    } catch (error) {
      console.error('Error deleting message for all:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete message for everyone');
    }
  };

  const value = {
    message,
    users,
    selectedUser,
    getUsers,
    getMessages,
    sendMessage,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    deleteMessageForMe,
    deleteMessageForAll,
  };
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
