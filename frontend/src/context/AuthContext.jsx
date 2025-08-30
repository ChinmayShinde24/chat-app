import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    // Initialize token from localStorage
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      // Set axios default headers if token exists
      axios.defaults.headers.common["token"] = storedToken;
    }
    return storedToken || null;
  });
  const [authUser, setAuthUser] = useState(null);
  const [onlineUser, setOnlineUser] = useState([]);
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  //Check if the user is authenticated if yes then set the user data and connect the socket
  const checkAuth = async () => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setAuthUser(null);
      return;
    }

    try {
      // Ensure axios headers are set before making the request
      axios.defaults.headers.common["token"] = storedToken;
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        setToken(storedToken); // Ensure token is set in state
        connectSocket(data.user);
      } else {
        // If check fails, clear auth state
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
      }
    } catch (err) {
      console.error("Auth check failed:", err.message);
      // Clear auth state on error
      localStorage.removeItem("token");
      setToken(null);
      setAuthUser(null);
    }
  };

  //Login fuction to handdle authentication
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);
      if (data.success) {
        setAuthUser(data.userData);
        connectSocket(data.userData);
        axios.defaults.headers.common["token"] = data.token;
        setToken(data.token);
        localStorage.setItem("token", data.token);
        toast.success(data.success);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.success(data.err);
    }
  };

  //Logout function
  const logout = () => {
    try {
      localStorage.removeItem("token");
      setToken(null);
      setAuthUser(null);
      setOnlineUser([]);
      axios.defaults.headers.common["token"] = null;

      if (socket) {
        socket.disconnect();
        setSocket(null);
      }

      toast.success("Logout successful");
      navigate("/login");
    } catch (err) {
      console.error("Error during logout:", err);
      toast.error("Error during logout");
    }
  };

  //Update userprofile
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  //connect socket function to handle socket connection and online users updates
  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;
    const newSocket = io(backendUrl, {
      query: {
        userId: userData._id,
      },
    });
    newSocket.connect();
    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (userId) => {
      setOnlineUser(userId);
    });
  };

  // Initialize auth when component mounts
  useEffect(() => {
    checkAuth();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []); // Empty dependency array to run only once on mount

  const value = {
    axios,
    authUser,
    onlineUser,
    socket,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
