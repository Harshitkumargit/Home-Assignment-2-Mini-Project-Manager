import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { projectsAPI } from "../services/api";
import LogoutConfirmation from "../components/LogoutConfirmation";
import AssistantBot from "../components/AssistantBot";
import type { Project } from "../types";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [newProject, setNewProject] = useState({ title: "", description: "" });
  const [isCreating, setIsCreating] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  // ✅ DARK MODE STATE
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // ✅ LOAD THEME FROM LOCALSTORAGE
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }

    // Get username and email from localStorage
    const storedName =
      localStorage.getItem("userName") ||
      JSON.parse(localStorage.getItem("user") || "{}")?.name ||
      "User";
    const storedEmail =
      JSON.parse(localStorage.getItem("user") || "{}")?.email ||
      localStorage.getItem("userEmail") ||
      "user@example.com";

    setUserName(storedName);
    setUserEmail(storedEmail);
    console.log("User loaded:", storedName, storedEmail);
  }, []);

  useEffect(() => {
    loadProjects();
  }, [refreshTrigger]);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const data = await projectsAPI.getAll();
      setProjects(data);
      setError("");
    } catch (err: any) {
      setError("Failed to load projects");
      console.error("Error loading projects:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title.trim()) return;

    setIsCreating(true);
    try {
      const created = await projectsAPI.create(newProject);
      setProjects([...projects, created]);
      setShowCreateModal(false);
      setNewProject({ title: "", description: "" });
      setError("");
    } catch (err: any) {
      setError("Failed to create project");
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;

    try {
      await projectsAPI.delete(projectId);
      setProjects(projects.filter((p) => p.id !== projectId));
      setError("");
    } catch (err: any) {
      setError("Failed to delete project");
      console.error(err);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setShowAccountMenu(false);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("auth");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      setIsLoggingOut(false);
    }
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleBotActionComplete = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // ✅ TOGGLE DARK MODE
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const totalCompleted = projects.reduce(
    (sum, p) => sum + p.completedTaskCount,
    0
  );

  if (isLoading) {
    return (
      <div
        className={`min-h-screen ${
          isDarkMode
            ? "bg-gray-900"
            : "bg-gradient-to-br from-blue-50 via-slate-50 to-cyan-50"
        } flex items-center justify-center`}
      >
        <style>{`
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
            50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8); }
          }
          .pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        `}</style>
        <div
          className={`animate-spin rounded-full h-16 w-16 border-4 ${
            isDarkMode
              ? "border-gray-700 border-t-blue-400"
              : "border-blue-100 border-t-blue-500"
          } pulse-glow`}
        ></div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        isDarkMode
          ? "bg-gray-900"
          : "bg-gradient-to-br from-blue-50 via-slate-50 to-cyan-50"
      } transition-colors duration-500`}
    >
      <style>{`
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes toggle-switch {
          0% { transform: translateX(0); }
          100% { transform: translateX(20px); }
        }
        .slide-down-animation { animation: slide-down 0.5s ease-out; }
        .fade-in-animation { animation: fade-in 0.6s ease-out; }
        .scale-in-animation { animation: scale-in 0.4s ease-out; }
        .float-animation { animation: float 3s ease-in-out infinite; }
        .toggle-switch { animation: toggle-switch 0.3s ease-in-out; }
      `}</style>

      {/* Header */}
      <header
        className={`${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-gradient-to-r from-blue-100 via-slate-50 to-cyan-100 border-blue-200"
        } shadow-lg sticky top-0 z-40 slide-down-animation backdrop-blur-md bg-opacity-90 border-b-2 transition-colors duration-500`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center gap-4">
            {/* Left - Logo & Title */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition duration-300">
                <span className="text-2xl">📋</span>
              </div>
              <div>
                <h1
                  className={`text-3xl font-bold ${
                    isDarkMode
                      ? "bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
                      : "bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"
                  }`}
                >
                  Task Manager
                </h1>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-slate-600"
                  }`}
                >
                  Organize your projects
                </p>
              </div>
            </div>

            {/* Right - Buttons + Account Menu */}
            <div className="flex gap-3 items-center">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition duration-300 animate-pulse hidden sm:block"
              >
                ✨ New Project
              </button>

              {/* ✅ DARK MODE TOGGLE BUTTON */}
              <button
                onClick={toggleTheme}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition duration-300 transform hover:scale-105 ${
                  isDarkMode
                    ? "bg-gray-700 text-yellow-400 border-2 border-yellow-500 hover:bg-gray-600"
                    : "bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-800 border-2 border-yellow-300 hover:shadow-lg"
                }`}
                title={
                  isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
                }
              >
                {isDarkMode ? (
                  <>
                    <span>☀️</span>
                    <span className="hidden sm:inline">Light</span>
                  </>
                ) : (
                  <>
                    <span>🌙</span>
                    <span className="hidden sm:inline">Dark</span>
                  </>
                )}
              </button>

              {/* ✅ ACCOUNT MENU */}
              <div className="relative">
                <button
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  className={`w-11 h-11 ${
                    isDarkMode
                      ? "bg-gradient-to-br from-gray-700 to-gray-600 border-gray-500"
                      : "bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 border-white"
                  } rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-110 transition duration-300 border-2 hover:border-purple-300 font-bold text-white`}
                  title="Account menu"
                >
                  {userName.charAt(0).toUpperCase()}
                </button>

                {/* Dropdown Menu */}
                {showAccountMenu && (
                  <div
                    className={`absolute right-0 mt-3 w-64 ${
                      isDarkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-blue-200"
                    } rounded-2xl shadow-2xl border-2 overflow-hidden fade-in-animation transition-colors duration-300`}
                  >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white bg-opacity-30 rounded-full flex items-center justify-center font-bold text-lg border-2 border-white">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-sm">{userName}</p>
                          <p className="text-xs opacity-90">{userEmail}</p>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div
                      className={`h-px ${
                        isDarkMode
                          ? "bg-gray-700"
                          : "bg-gradient-to-r from-transparent via-blue-200 to-transparent"
                      }`}
                    ></div>

                    {/* Account Info */}
                    <div className="p-4 space-y-2">
                      <div
                        className={`${
                          isDarkMode
                            ? "bg-gray-700 border-gray-600"
                            : "bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200"
                        } rounded-lg p-3 border`}
                      >
                        <p
                          className={`text-xs font-semibold ${
                            isDarkMode ? "text-gray-400" : "text-slate-600"
                          }`}
                        >
                          LOGGED IN AS
                        </p>
                        <p
                          className={`text-sm font-bold mt-1 ${
                            isDarkMode ? "text-white" : "text-slate-800"
                          }`}
                        >
                          {userName}
                        </p>
                        <p
                          className={`text-xs mt-1 truncate ${
                            isDarkMode ? "text-gray-400" : "text-slate-500"
                          }`}
                        >
                          {userEmail}
                        </p>
                      </div>

                      <div
                        className={`${
                          isDarkMode
                            ? "bg-gray-700 border-gray-600"
                            : "bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200"
                        } rounded-lg p-3 border`}
                      >
                        <p
                          className={`text-xs font-semibold ${
                            isDarkMode ? "text-gray-400" : "text-slate-600"
                          }`}
                        >
                          STATS
                        </p>
                        <div className="flex gap-2 mt-2">
                          <div className="flex-1">
                            <p
                              className={`text-lg font-bold ${
                                isDarkMode ? "text-blue-400" : "text-blue-600"
                              }`}
                            >
                              {projects.length}
                            </p>
                            <p
                              className={`text-xs ${
                                isDarkMode ? "text-gray-400" : "text-slate-600"
                              }`}
                            >
                              Projects
                            </p>
                          </div>
                          <div
                            className={`w-1 h-12 rounded-full ${
                              isDarkMode ? "bg-gray-600" : "bg-blue-300"
                            }`}
                          ></div>
                          <div className="flex-1">
                            <p
                              className={`text-lg font-bold ${
                                isDarkMode ? "text-green-400" : "text-green-600"
                              }`}
                            >
                              {totalCompleted}
                            </p>
                            <p
                              className={`text-xs ${
                                isDarkMode ? "text-gray-400" : "text-slate-600"
                              }`}
                            >
                              Completed
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div
                      className={`h-px ${
                        isDarkMode
                          ? "bg-gray-700"
                          : "bg-gradient-to-r from-transparent via-slate-200 to-transparent"
                      }`}
                    ></div>

                    {/* Logout Button */}
                    <button
                      onClick={handleLogoutClick}
                      className="w-full px-4 py-3 bg-gradient-to-r from-red-400 to-red-500 text-white font-semibold hover:from-red-500 hover:to-red-600 transition duration-200 flex items-center justify-center gap-2"
                    >
                      <span>🚪</span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Error Message */}
        {error && (
          <div
            className={`mb-8 p-4 ${
              isDarkMode
                ? "bg-red-900 border-red-700 text-red-200"
                : "bg-red-100 border-red-400 text-red-700"
            } border-l-4 rounded-lg backdrop-blur-sm shadow-lg scale-in-animation transition-colors duration-300`}
          >
            {error}
            <button
              onClick={() => setError("")}
              className="ml-4 underline text-sm hover:opacity-80 transition"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Welcome Section */}
        <div
          className={`mb-12 ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-gradient-to-br from-blue-50 via-slate-50 to-cyan-50 border-blue-200"
          } rounded-2xl p-8 shadow-lg border-2 scale-in-animation transition-colors duration-300`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2
                className={`text-3xl font-bold mb-2 ${
                  isDarkMode ? "text-white" : "text-slate-800"
                }`}
              >
                Welcome back,{" "}
                <span
                  className={`${
                    isDarkMode
                      ? "bg-gradient-to-r from-blue-400 to-cyan-400"
                      : "bg-gradient-to-r from-blue-600 to-cyan-600"
                  } bg-clip-text text-transparent font-extrabold`}
                >
                  {userName}
                </span>
                ! 👋
              </h2>
              <p className={isDarkMode ? "text-gray-400" : "text-slate-600"}>
                You have{" "}
                <span
                  className={`font-bold ${
                    isDarkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  {projects.length}
                </span>{" "}
                project{projects.length !== 1 ? "s" : ""} in total
              </p>
            </div>
            <div className="text-5xl animate-bounce hidden md:block">✨</div>
          </div>
        </div>

        {/* Projects Section */}
        {projects.length === 0 ? (
          <div
            className={`${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-gradient-to-br from-white via-blue-50 to-slate-50 border-blue-100"
            } rounded-2xl shadow-xl p-16 text-center border-2 scale-in-animation transition-colors duration-300`}
          >
            <div className="text-6xl mb-4 float-animation">📚</div>
            <h2
              className={`text-3xl font-bold ${
                isDarkMode
                  ? "bg-gradient-to-r from-gray-300 to-blue-400 bg-clip-text text-transparent"
                  : "bg-gradient-to-r from-slate-700 to-blue-600 bg-clip-text text-transparent"
              } mb-4`}
            >
              No projects yet
            </h2>
            <p
              className={`${
                isDarkMode ? "text-gray-400" : "text-slate-600"
              } mb-8 text-lg`}
            >
              Create your first project to get started with task management
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition duration-300 text-lg"
            >
              ✨ Create First Project
            </button>
          </div>
        ) : (
          <div>
            {/* Your Projects Header */}
            <div className="flex items-center gap-3 mb-8">
              <div
                className={`p-2 rounded-lg text-3xl ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-blue-300"
                } border-2 shadow-sm`}
              >
                📋
              </div>
              <h3
                className={`text-2xl font-bold ${
                  isDarkMode ? "text-white" : "text-slate-800"
                }`}
              >
                Your Projects ({projects.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, index) => (
                <div
                  key={project.id}
                  className={`${
                    isDarkMode
                      ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
                      : "bg-gradient-to-br from-white via-slate-50 to-blue-50 border-blue-100"
                  } rounded-2xl shadow-lg p-6 hover:shadow-2xl transition duration-300 transform hover:scale-105 border-2 cursor-pointer float-animation scale-in-animation`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3
                        className={`text-xl font-bold mb-2 line-clamp-2 ${
                          isDarkMode ? "text-white" : "text-slate-800"
                        }`}
                      >
                        {project.title}
                      </h3>
                      {project.description && (
                        <p
                          className={`text-sm line-clamp-2 ${
                            isDarkMode ? "text-gray-400" : "text-slate-600"
                          }`}
                        >
                          {project.description}
                        </p>
                      )}
                    </div>
                    <div className="text-3xl ml-2">📁</div>
                  </div>

                  <div
                    className={`${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600"
                        : "bg-gradient-to-r from-blue-100 to-cyan-100 border-blue-200"
                    } rounded-lg p-4 mb-4 border`}
                  >
                    <div className="flex justify-between items-center gap-4">
                      <div className="text-center flex-1">
                        <div
                          className={`text-2xl font-bold ${
                            isDarkMode ? "text-blue-400" : "text-blue-600"
                          }`}
                        >
                          {project.taskCount}
                        </div>
                        <div
                          className={`text-xs ${
                            isDarkMode ? "text-gray-400" : "text-slate-600"
                          }`}
                        >
                          Tasks
                        </div>
                      </div>
                      <div
                        className={`w-1 h-12 rounded-full ${
                          isDarkMode ? "bg-gray-600" : "bg-blue-300"
                        }`}
                      ></div>
                      <div className="text-center flex-1">
                        <div
                          className={`text-2xl font-bold ${
                            isDarkMode ? "text-green-400" : "text-green-600"
                          }`}
                        >
                          {project.completedTaskCount}
                        </div>
                        <div
                          className={`text-xs ${
                            isDarkMode ? "text-gray-400" : "text-slate-600"
                          }`}
                        >
                          Done
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span
                        className={`text-xs font-semibold ${
                          isDarkMode ? "text-gray-400" : "text-slate-600"
                        }`}
                      >
                        Progress
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          isDarkMode ? "text-blue-400" : "text-blue-600"
                        }`}
                      >
                        {project.taskCount > 0
                          ? Math.round(
                              (project.completedTaskCount / project.taskCount) *
                                100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <div
                      className={`w-full h-3 ${
                        isDarkMode ? "bg-gray-700" : "bg-slate-200"
                      } rounded-full overflow-hidden`}
                    >
                      <div
                        className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
                        style={{
                          width:
                            project.taskCount > 0
                              ? `${
                                  (project.completedTaskCount /
                                    project.taskCount) *
                                  100
                                }%`
                              : "0%",
                        }}
                      ></div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.id);
                    }}
                    className="w-full px-4 py-2 bg-gradient-to-r from-red-400 to-red-500 text-white font-semibold rounded-lg hover:shadow-lg transition duration-200 transform hover:scale-105 text-sm"
                  >
                    🗑️ Delete Project
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div
          className={`fixed inset-0 ${
            isDarkMode ? "bg-black bg-opacity-60" : "bg-black bg-opacity-40"
          } flex items-center justify-center p-4 z-50 backdrop-blur-sm fade-in-animation transition-colors duration-300`}
        >
          <div
            className={`${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-gradient-to-br from-white via-green-50 to-slate-50 border-green-200"
            } rounded-2xl p-8 max-w-md w-full shadow-2xl scale-in-animation border-2 transition-colors duration-300`}
          >
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-green-200 to-emerald-300 rounded-full flex items-center justify-center">
                  <span className="text-xl">✨</span>
                </div>
                <h2
                  className={`text-2xl font-bold ${
                    isDarkMode
                      ? "bg-gradient-to-r from-gray-300 to-green-400 bg-clip-text text-transparent"
                      : "bg-gradient-to-r from-slate-700 to-green-600 bg-clip-text text-transparent"
                  }`}
                >
                  New Project
                </h2>
              </div>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-slate-600"
                }`}
              >
                Create a new project to organize your tasks
              </p>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-5">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Project Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) =>
                    setNewProject({ ...newProject, title: e.target.value })
                  }
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                      : "bg-white border-green-200 text-slate-800 placeholder-slate-400 hover:border-green-300"
                  }`}
                  placeholder="e.g., Website Redesign"
                  required
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Description (optional)
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      description: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-none h-24 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                      : "bg-white border-green-200 text-slate-800 placeholder-slate-400 hover:border-green-300"
                  }`}
                  placeholder="Add a description for your project..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewProject({ title: "", description: "" });
                  }}
                  className={`flex-1 px-6 py-3 ${
                    isDarkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gradient-to-r from-slate-300 to-slate-400 text-slate-700"
                  } font-semibold rounded-lg hover:shadow-lg transition transform hover:scale-105 duration-300`}
                >
                  ✕ Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-lg disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition transform hover:scale-105 duration-300 shadow-lg flex items-center justify-center gap-2"
                >
                  {isCreating ? (
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
                      Creating...
                    </>
                  ) : (
                    <>✨ Create Project</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Modal */}
      <LogoutConfirmation
        isOpen={showLogoutModal}
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
        isLoading={isLoggingOut}
      />

      {/* Assistant Bot */}
      <AssistantBot
        projectCount={projects.length}
        completedCount={totalCompleted}
        onActionComplete={handleBotActionComplete}
      />

      {/* Overlay to close menu when clicking outside */}
      {showAccountMenu && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setShowAccountMenu(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
