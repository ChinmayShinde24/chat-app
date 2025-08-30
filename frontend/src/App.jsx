import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import { Toaster } from "react-hot-toast";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import BgImage from "./assets/bgImage.svg";

const App = () => {
  const { authUser } = useContext(AuthContext);

  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div className="fixed inset-0 -z-10 w-full h-full">
        <img
          src={BgImage}
          alt="Background"
          className="w-full h-full object-cover md:object-cover"
          style={{
            minHeight: "100vh",
            minWidth: "100vw",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
      </div>

      {/* App Content */}
      <div className="relative z-10">
        <Toaster />
        <Routes>
          <Route
            path="/"
            element={authUser ? <HomePage /> : <Navigate to="/login" />}
          />
          <Route
            path="/login"
            element={!authUser ? <LoginPage /> : <Navigate to="/" />}
          />
          <Route
            path="/profile"
            element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </div>
  );
};

export default App;
