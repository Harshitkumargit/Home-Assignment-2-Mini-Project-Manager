import React from "react";

interface LogoutConfirmationProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const LogoutConfirmation: React.FC<LogoutConfirmationProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50 backdrop-blur-sm fade-in-animation">
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .fade-in-animation { animation: fade-in 0.3s ease-out; }
        .scale-in-animation { animation: scale-in 0.4s ease-out; }
        .shake-animation { animation: shake 0.5s ease-in-out; }
      `}</style>

      <div className="bg-gradient-to-br from-white via-red-50 to-slate-50 rounded-2xl p-8 max-w-sm w-full shadow-2xl scale-in-animation border-2 border-red-200">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-red-200 to-red-300 rounded-full flex items-center justify-center">
            <span className="text-3xl">👋</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-2">
          Logout Confirmation
        </h2>

        {/* Message */}
        <p className="text-center text-slate-600 mb-8">
          Are you sure you want to logout? You will need to sign in again to
          access your tasks and projects.
        </p>

        {/* Warning */}
        <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded mb-8">
          <p className="text-sm text-red-700 font-medium">
            💡 Tip: Make sure you have saved all your work before logging out.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-slate-300 to-slate-400 text-slate-700 font-semibold rounded-lg hover:shadow-lg transition transform hover:scale-105 duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✕ Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:shadow-lg transition transform hover:scale-105 duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Logging out...
              </>
            ) : (
              <>
                🚪 Logout
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmation;
