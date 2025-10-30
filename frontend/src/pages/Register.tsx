import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // ✅ PASSWORD VISIBILITY TOGGLES
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ✅ PASSWORD REQUIREMENT CHECKLIST
  const [passwordChecks, setPasswordChecks] = useState({
    minLength: false,
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const navigate = useNavigate();

  const checkPasswordRequirements = (pwd: string) => {
    const checks = {
      minLength: pwd.length >= 8,
      hasLowercase: /[a-z]/.test(pwd),
      hasUppercase: /[A-Z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
    };

    setPasswordChecks(checks);

    // Calculate strength
    let strength = 0;
    if (checks.minLength) strength++;
    if (checks.hasLowercase) strength++;
    if (checks.hasUppercase) strength++;
    if (checks.hasNumber) strength++;
    if (checks.hasSpecialChar) strength++;

    setPasswordStrength(strength);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pwd = e.target.value;
    setPassword(pwd);
    checkPasswordRequirements(pwd);
  };

  const validateForm = (): boolean => {
    // ✅ MANDATORY NAME CHECK
    if (!name.trim()) {
      setError("❌ Full name is required");
      return false;
    }

    if (name.trim().length < 2) {
      setError("❌ Name must be at least 2 characters");
      return false;
    }

    if (!email.trim()) {
      setError("❌ Email is required");
      return false;
    }

    if (!email.includes("@")) {
      setError("❌ Please enter a valid email");
      return false;
    }

    if (!username.trim()) {
      setError("❌ Username is required");
      return false;
    }

    if (username.trim().length < 3) {
      setError("❌ Username must be at least 3 characters");
      return false;
    }

    if (!password) {
      setError("❌ Password is required");
      return false;
    }

    if (password.length < 8) {
      setError("❌ Password must be at least 8 characters");
      return false;
    }

    if (
      !passwordChecks.hasLowercase ||
      !passwordChecks.hasUppercase ||
      !passwordChecks.hasNumber ||
      !passwordChecks.hasSpecialChar
    ) {
      setError(
        "❌ Password must contain lowercase, UPPERCASE, number, and special character"
      );
      return false;
    }

    if (password !== confirmPassword) {
      setError("❌ Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const requestData = {
        name: name.trim(),
        email: email.trim(),
        username: username.trim(),
        password,
      };

      console.log("📤 Sending registration request:", requestData);

      // ✅ CORRECT PORT 8080 (Not 5000!)
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestData),
      });

      console.log("📥 Response status:", response.status);

      // ✅ Handle response based on content type
      const contentType = response.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
        console.log("✅ Response data:", data);
      } else {
        const text = await response.text();
        console.log("⚠️ Non-JSON response:", text);
        data = { message: text || "Registration failed" };
      }

      if (!response.ok) {
        // ✅ BETTER ERROR MESSAGES
        if (response.status === 400) {
          setError(
            data.message ||
              data.errors?.Name?.[0] ||
              "Invalid registration data. Please check all fields."
          );
        } else if (response.status === 409) {
          setError("Username or email already exists. Please try another.");
        } else if (response.status === 500) {
          setError("Server error. Please try again later or contact support.");
        } else {
          setError(
            data.message ||
              `Registration failed (${response.status}). Please try again.`
          );
        }
        return;
      }

      // ✅ SUCCESS - SAVE NAME TO LOCALSTORAGE
      localStorage.setItem("userName", name.trim());
      localStorage.setItem("userEmail", email.trim());

      // Optional: Save full response if available
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      console.log("✅ Account created successfully! Name:", name);

      // Navigate to login
      navigate("/login", {
        state: {
          message: "✅ Account created successfully! Please log in.",
          email: email.trim(),
        },
      });
    } catch (err: any) {
      console.error("❌ Registration error:", err);

      // ✅ NETWORK ERROR HANDLING
      if (err instanceof TypeError && err.message.includes("Failed to fetch")) {
        setError(
          "🚨 Connection error. Make sure the backend is running on http://localhost:8080"
        );
      } else if (err.name === "SyntaxError") {
        setError("Invalid response from server. Please try again.");
      } else {
        setError(err.message || "An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "bg-gray-300";
    if (passwordStrength === 1) return "bg-red-500";
    if (passwordStrength === 2) return "bg-orange-500";
    if (passwordStrength === 3) return "bg-yellow-500";
    if (passwordStrength === 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return "Strength: N/A";
    if (passwordStrength === 1) return "Strength: Very Weak";
    if (passwordStrength === 2) return "Strength: Weak";
    if (passwordStrength === 3) return "Strength: Fair";
    if (passwordStrength === 4) return "Strength: Good";
    return "Strength: Very Strong";
  };

  const isPasswordValid = Object.values(passwordChecks).every((check) => check);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 py-8">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
        .animate-slideUp { animation: slideUp 0.6s ease-out forwards; }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>

      <div className="max-w-md w-full animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 transform transition-all hover:scale-[1.01]">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center animate-bounce-slow">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Create Account
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Join us to manage your projects
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-3 sm:p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded animate-shake">
              <div className="flex items-center">
                <span className="text-xl mr-2">⚠️</span>
                <span className="text-sm sm:text-base">{error}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Full Name - MANDATORY */}
            <div
              className="animate-slideUp"
              style={{
                opacity: 0,
                animationDelay: "0s",
                animationFillMode: "forwards",
              }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                placeholder="Enter your full name"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 This is required for your account
              </p>
            </div>

            {/* Email */}
            <div
              className="animate-slideUp"
              style={{
                opacity: 0,
                animationDelay: "0.05s",
                animationFillMode: "forwards",
              }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>

            {/* Username */}
            <div
              className="animate-slideUp"
              style={{
                opacity: 0,
                animationDelay: "0.1s",
                animationFillMode: "forwards",
              }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                placeholder="Choose a username (3+ chars)"
                required
                disabled={isLoading}
              />
            </div>

            {/* Password with Eye Icon */}
            <div
              className="animate-slideUp"
              style={{
                opacity: 0,
                animationDelay: "0.15s",
                animationFillMode: "forwards",
              }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500 font-bold">*</span>
              </label>

              {/* Password Input with Eye Icon */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base pr-10"
                  placeholder="Create a strong password"
                  required
                  disabled={isLoading}
                />

                {/* ✅ EYE ICON BUTTON */}
                {password && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-blue-600 transition-colors focus:outline-none"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      // 👁️ Open Eye Icon (password visible)
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                      </svg>
                    ) : (
                      // 👁️‍🗨️ Closed Eye Icon (password hidden)
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 001 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm5.31-7.78l3.15 3.15.02-.02c.68 1.22 1.07 2.59 1.07 4.05 0 2.76-2.24 5-5 5-.07 0-.14 0-.2-.01l3.96-3.96z" />
                      </svg>
                    )}
                  </button>
                )}
              </div>

              {/* Password Strength Bar */}
              {password && (
                <div className="mt-3">
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{
                        width: `${(passwordStrength / 5) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <p
                    className={`text-xs font-semibold mb-3 ${
                      isPasswordValid ? "text-green-600" : "text-blue-600"
                    }`}
                  >
                    {getPasswordStrengthText()}
                  </p>

                  {/* ✅ PASSWORD REQUIREMENTS CHECKLIST */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-3 border-2 border-blue-200">
                    <p className="text-xs font-bold text-gray-700 mb-2">
                      📋 Password Requirements:
                    </p>

                    {/* Minimum Length */}
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                          passwordChecks.minLength
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      >
                        {passwordChecks.minLength ? "✓" : "○"}
                      </div>
                      <span className="text-xs text-gray-700">
                        At least <strong>8 characters</strong>
                      </span>
                    </div>

                    {/* Lowercase */}
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                          passwordChecks.hasLowercase
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      >
                        {passwordChecks.hasLowercase ? "✓" : "○"}
                      </div>
                      <span className="text-xs text-gray-700">
                        Lowercase letter <strong>(a-z)</strong>
                      </span>
                    </div>

                    {/* Uppercase */}
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                          passwordChecks.hasUppercase
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      >
                        {passwordChecks.hasUppercase ? "✓" : "○"}
                      </div>
                      <span className="text-xs text-gray-700">
                        Uppercase letter <strong>(A-Z)</strong>
                      </span>
                    </div>

                    {/* Number */}
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                          passwordChecks.hasNumber
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      >
                        {passwordChecks.hasNumber ? "✓" : "○"}
                      </div>
                      <span className="text-xs text-gray-700">
                        Number <strong>(0-9)</strong>
                      </span>
                    </div>

                    {/* Special Character */}
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                          passwordChecks.hasSpecialChar
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      >
                        {passwordChecks.hasSpecialChar ? "✓" : "○"}
                      </div>
                      <span className="text-xs text-gray-700">
                        Special character{" "}
                        <strong>
                          (!@#$%^&*()_+-=[]{};&apos;:&quot;\|,.&lt;&gt;/?)
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password with Eye Icon */}
            <div
              className="animate-slideUp"
              style={{
                opacity: 0,
                animationDelay: "0.2s",
                animationFillMode: "forwards",
              }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password{" "}
                <span className="text-red-500 font-bold">*</span>
              </label>

              {/* Confirm Password Input with Eye Icon */}
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base pr-10 ${
                    confirmPassword && password !== confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Re-enter your password"
                  required
                  disabled={isLoading}
                />

                {/* ✅ EYE ICON BUTTON FOR CONFIRM PASSWORD */}
                {confirmPassword && (
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-blue-600 transition-colors focus:outline-none"
                    title={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      // 👁️ Open Eye Icon
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                      </svg>
                    ) : (
                      // 👁️‍🗨️ Closed Eye Icon
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 001 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm5.31-7.78l3.15 3.15.02-.02c.68 1.22 1.07 2.59 1.07 4.05 0 2.76-2.24 5-5 5-.07 0-.14 0-.2-.01l3.96-3.96z" />
                      </svg>
                    )}
                  </button>
                )}
              </div>

              {/* Match Feedback */}
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">
                  ⚠️ Passwords do not match
                </p>
              )}
              {confirmPassword && password === confirmPassword && (
                <p className="text-xs text-green-600 mt-1">✓ Passwords match</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                isLoading ||
                !name ||
                !email ||
                !username ||
                !isPasswordValid ||
                password !== confirmPassword
              }
              className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
                    viewBox="0 0 24 24"
                  >
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
                  Creating Account...
                </span>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-500 hover:text-blue-600 font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div
            className="animate-slideUp"
            style={{
              opacity: 0,
              animationDelay: "0.25s",
              animationFillMode: "forwards",
            }}
          >
            <div className="text-2xl mb-1">👤</div>
            <p className="text-xs text-gray-600">Personal Info</p>
          </div>
          <div
            className="animate-slideUp"
            style={{
              opacity: 0,
              animationDelay: "0.3s",
              animationFillMode: "forwards",
            }}
          >
            <div className="text-2xl mb-1">🔒</div>
            <p className="text-xs text-gray-600">Secure Account</p>
          </div>
          <div
            className="animate-slideUp"
            style={{
              opacity: 0,
              animationDelay: "0.35s",
              animationFillMode: "forwards",
            }}
          >
            <div className="text-2xl mb-1">✅</div>
            <p className="text-xs text-gray-600">Get Started</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
