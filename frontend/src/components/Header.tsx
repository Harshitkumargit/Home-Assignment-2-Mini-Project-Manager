import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoutConfirmation from "./LogoutConfirmation";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("auth");

      // Redirect to login
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      setIsLoggingOut(false);
    }
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <header className="bg-gradient-to-r from-blue-100 via-slate-50 to-cyan-100 shadow-lg sticky top-0 z-40 backdrop-blur-md bg-opacity-90 border-b-2 border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center gap-4">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-lg">📋</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Task Manager
              </h1>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogoutClick}
              className="px-6 py-2 bg-gradient-to-r from-red-400 to-red-500 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition duration-300"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmation
        isOpen={showLogoutModal}
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
        isLoading={isLoggingOut}
      />
    </>
  );
};

export default Header;
