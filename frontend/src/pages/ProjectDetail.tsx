"use client";

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projectsAPI, tasksAPI } from "../services/api";
import type { Project, Task, CreateTaskDTO, UpdateTaskDTO } from "../types";

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [editProjectName, setEditProjectName] = useState("");
  const [editProjectDescription, setEditProjectDescription] = useState("");
  const [isUpdatingProject, setIsUpdatingProject] = useState(false);
  const [newTask, setNewTask] = useState<CreateTaskDTO>({
    title: "",
    dueDate: "",
  });
  const [newTaskDate, setNewTaskDate] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("09:00");
  const [newTaskPeriod, setNewTaskPeriod] = useState<"AM" | "PM">("AM");
  const [isCreating, setIsCreating] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingTask, setEditingTask] = useState<UpdateTaskDTO | null>(null);
  const [editTaskDate, setEditTaskDate] = useState("");
  const [editTaskTime, setEditTaskTime] = useState("09:00");
  const [editTaskPeriod, setEditTaskPeriod] = useState<"AM" | "PM">("AM");

  useEffect(() => {
    if (id) {
      loadProjectAndTasks();
    }
  }, [id]);

  const loadProjectAndTasks = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const [projectData, tasksData] = await Promise.all([
        projectsAPI.getById(parseInt(id)),
        tasksAPI.getAll(parseInt(id)),
      ]);
      setProject(projectData);
      setTasks(tasksData);
    } catch (err: any) {
      setError("Failed to load project");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const convertTo24Hour = (time12: string, period: "AM" | "PM"): string => {
    const [h, m] = time12.split(":").map((v) => parseInt(v) || 0);
    let h24 = h;

    if (period === "AM") {
      if (h === 12) h24 = 0;
    } else {
      if (h !== 12) h24 = h + 12;
    }

    return `${String(h24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  // Edit Project Functions - FIXED TYPE ERRORS
  const openEditProjectModal = () => {
    if (project) {
      setEditProjectName(project.title);
      setEditProjectDescription(project.description || ""); // FIX: Handle null description
      setShowEditProjectModal(true);
    }
  };

  const closeEditProjectModal = () => {
    setShowEditProjectModal(false);
    setEditProjectName("");
    setEditProjectDescription("");
  };

  const handleSaveProjectEdit = async () => {
    if (!editProjectName.trim() || !id) {
      setError("Project name cannot be empty!");
      return;
    }

    try {
      setIsUpdatingProject(true);
      await projectsAPI.update(parseInt(id), {
        title: editProjectName.trim(),
        description: editProjectDescription.trim(),
      });

      setError("");
      await loadProjectAndTasks();
      closeEditProjectModal();
    } catch (err: any) {
      setError("Failed to update project");
    } finally {
      setIsUpdatingProject(false);
    }
  };

  // Delete Project Function
  const handleDeleteProject = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this entire project? This action cannot be undone."
      )
    )
      return;
    if (!id) return;

    try {
      await projectsAPI.delete(parseInt(id));
      navigate("/dashboard");
    } catch (err: any) {
      setError("Failed to delete project");
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim() || !id) return;

    setIsCreating(true);
    try {
      let dueDateValue = "";
      if (newTaskDate && newTaskTime) {
        const time24 = convertTo24Hour(newTaskTime, newTaskPeriod);
        const dateTime = new Date(`${newTaskDate}T${time24}:00Z`);
        dueDateValue = dateTime.toISOString();
      }

      const taskData: CreateTaskDTO = {
        title: newTask.title,
        ...(dueDateValue && { dueDate: dueDateValue }),
      };
      const created = await tasksAPI.create(parseInt(id), taskData);
      setTasks([...tasks, created]);
      setShowCreateModal(false);
      setNewTask({ title: "", dueDate: "" });
      setNewTaskDate("");
      setNewTaskTime("09:00");
      setNewTaskPeriod("AM");
      await loadProjectAndTasks();
    } catch (err: any) {
      setError("Failed to create task");
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleTask = async (taskId: number) => {
    try {
      const updated = await tasksAPI.toggle(taskId);
      setTasks(tasks.map((t) => (t.id === taskId ? updated : t)));
      await loadProjectAndTasks();
    } catch (err: any) {
      setError("Failed to toggle task");
    }
  };

  const handleStartEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTask({
      title: task.title,
      dueDate: task.dueDate || "",
      isCompleted: task.isCompleted,
    });
    if (task.dueDate) {
      const date = task.dueDate.split("T")[0];
      const timeStr = task.dueDate.split("T")[1]?.slice(0, 5) || "09:00";
      const [h24, m] = timeStr.split(":").map(Number);

      let h12 = h24;
      let period: "AM" | "PM" = "AM";

      if (h24 === 0) {
        h12 = 12;
        period = "AM";
      } else if (h24 === 12) {
        h12 = 12;
        period = "PM";
      } else if (h24 > 12) {
        h12 = h24 - 12;
        period = "PM";
      } else {
        h12 = h24;
        period = "AM";
      }

      setEditTaskDate(date);
      setEditTaskTime(
        `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")}`
      );
      setEditTaskPeriod(period);
    }
  };

  const handleSaveEdit = async (taskId: number) => {
    if (!editingTask || !editingTask.title.trim()) {
      setError("Task title cannot be empty");
      return;
    }

    try {
      let dueDateValue = "";
      if (editTaskDate && editTaskTime) {
        const time24 = convertTo24Hour(editTaskTime, editTaskPeriod);
        const dateTime = new Date(`${editTaskDate}T${time24}:00Z`);
        dueDateValue = dateTime.toISOString();
      }

      const updated = await tasksAPI.update(taskId, {
        ...editingTask,
        dueDate: dueDateValue,
      });
      setTasks(tasks.map((t) => (t.id === taskId ? updated : t)));
      setEditingTaskId(null);
      setEditingTask(null);
      await loadProjectAndTasks();
    } catch (err: any) {
      setError("Failed to update task");
    }
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditingTask(null);
    setEditTaskDate("");
    setEditTaskTime("09:00");
    setEditTaskPeriod("AM");
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await tasksAPI.delete(taskId);
      setTasks(tasks.filter((t) => t.id !== taskId));
      await loadProjectAndTasks();
    } catch (err: any) {
      setError("Failed to delete task");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return null;

    const parts = dateString.split("T");
    if (parts.length < 2) return null;

    const timePart = parts[1].split(":");
    const hours = parseInt(timePart[0], 10);
    const minutes = parseInt(timePart[1], 10);

    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;

    return `${displayHours}:${String(minutes).padStart(2, "0")} ${ampm}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
            50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8); }
          }
          .float-animation { animation: float 3s ease-in-out infinite; }
          .pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        `}</style>
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-500 pulse-glow"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center bg-white bg-opacity-80 backdrop-blur-md p-8 rounded-2xl shadow-2xl transform hover:scale-105 transition duration-300">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">
            Project not found
          </h2>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 bg-gradient-to-r from-blue-400 to-cyan-500 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition duration-300 font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
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
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .slide-down-animation { animation: slide-down 0.5s ease-out; }
        .fade-in-animation { animation: fade-in 0.6s ease-out; }
        .scale-in-animation { animation: scale-in 0.4s ease-out; }
        .float-animation { animation: float 3s ease-in-out infinite; }
        .gradient-animation {
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }
      `}</style>

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 shadow-lg sticky top-0 z-40 slide-down-animation backdrop-blur-md bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 bg-gradient-to-r from-slate-300 to-blue-200 text-slate-700 rounded-lg hover:shadow-lg transform hover:scale-105 transition duration-300 font-semibold"
              >
                ← Back
              </button>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent truncate">
                  {project.title}
                </h1>
                {project.description && (
                  <p className="text-xs sm:text-sm text-slate-600 truncate">
                    {project.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={openEditProjectModal}
                className="px-4 sm:px-6 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-semibold rounded-lg hover:shadow-xl transform hover:scale-105 transition duration-300 flex-shrink-0 text-sm sm:text-base"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 sm:px-6 py-2 bg-gradient-to-r from-blue-400 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-xl transform hover:scale-105 transition duration-300 flex-shrink-0 text-sm sm:text-base animate-pulse"
              >
                + New Task
              </button>
              <button
                onClick={handleDeleteProject}
                className="px-4 sm:px-6 py-2 bg-gradient-to-r from-red-400 to-red-500 text-white font-semibold rounded-lg hover:shadow-xl transform hover:scale-105 transition duration-300 flex-shrink-0 text-sm sm:text-base"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-400 text-red-700 rounded-lg backdrop-blur-sm shadow-lg scale-in-animation">
            {error}
            <button
              onClick={() => setError("")}
              className="ml-4 underline text-sm hover:text-red-900 transition"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="bg-gradient-to-br from-white via-blue-50 to-slate-50 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition duration-300 transform hover:scale-105 float-animation border-l-4 border-blue-500">
            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
              {project.taskCount}
            </div>
            <div className="text-slate-600 mt-2 text-sm font-semibold">
              Total Tasks
            </div>
            <div className="mt-3 w-full h-2 bg-blue-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"
                style={{ width: "100%" }}
              ></div>
            </div>
          </div>
          <div
            className="bg-gradient-to-br from-white via-green-50 to-slate-50 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition duration-300 transform hover:scale-105 float-animation border-l-4 border-green-500"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
              {project.completedTaskCount}
            </div>
            <div className="text-slate-600 mt-2 text-sm font-semibold">
              Completed
            </div>
            <div className="mt-3 w-full h-2 bg-green-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
                style={{
                  width:
                    project.taskCount > 0
                      ? `${
                          (project.completedTaskCount / project.taskCount) * 100
                        }%`
                      : "0%",
                }}
              ></div>
            </div>
          </div>
          <div
            className="bg-gradient-to-br from-white via-orange-50 to-slate-50 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition duration-300 transform hover:scale-105 float-animation border-l-4 border-orange-500"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
              {project.taskCount - project.completedTaskCount}
            </div>
            <div className="text-slate-600 mt-2 text-sm font-semibold">
              Pending
            </div>
            <div className="mt-3 w-full h-2 bg-orange-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full transition-all duration-500"
                style={{
                  width:
                    project.taskCount > 0
                      ? `${
                          ((project.taskCount - project.completedTaskCount) /
                            project.taskCount) *
                          100
                        }%`
                      : "0%",
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        {tasks.length === 0 ? (
          <div className="bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-2xl shadow-xl p-12 text-center scale-in-animation border border-blue-100">
            <div className="text-6xl mb-4 float-animation">📝</div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-blue-600 bg-clip-text text-transparent mb-2">
              No tasks yet
            </h2>
            <p className="text-slate-600 mb-6">
              Create your first task to get started!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-3 bg-gradient-to-r from-blue-400 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition duration-300"
            >
              Create Task
            </button>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-white via-slate-50 to-purple-50 rounded-2xl shadow-xl p-6 scale-in-animation border border-blue-100">
            <h2 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-blue-600 bg-clip-text text-transparent mb-6">
              📋 Tasks
            </h2>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 border-b-2 border-blue-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      Task Title
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      Time
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100">
                  {tasks.map((task, index) => (
                    <tr
                      key={task.id}
                      className={`hover:bg-blue-50 transition duration-200 ${
                        task.isCompleted ? "bg-slate-50" : ""
                      }`}
                      style={{
                        animation: `fade-in 0.5s ease-out ${index * 0.1}s both`,
                      }}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={task.isCompleted}
                          onChange={() => handleToggleTask(task.id)}
                          className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer accent-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-sm ${
                            task.isCompleted
                              ? "line-through text-slate-400"
                              : "text-slate-800 font-medium"
                          }`}
                        >
                          {task.title}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {task.dueDate ? (
                          <span className="inline-flex items-center gap-1">
                            📅 {formatDate(task.dueDate)}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {task.dueDate ? (
                          <span className="inline-flex items-center gap-1">
                            🕐 {formatTime(task.dueDate)}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleStartEdit(task)}
                            disabled={task.isCompleted}
                            className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-sm rounded hover:shadow-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="px-3 py-1 bg-gradient-to-r from-red-400 to-red-500 text-white text-sm rounded hover:shadow-lg transition duration-200 transform hover:scale-105"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden space-y-3">
              {tasks.map((task, index) => (
                <div
                  key={task.id}
                  className="bg-gradient-to-br from-white to-blue-50 rounded-lg p-4 border border-blue-200 shadow-md hover:shadow-lg transition duration-200"
                  style={{
                    animation: `scale-in 0.4s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={task.isCompleted}
                      onChange={() => handleToggleTask(task.id)}
                      className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer accent-blue-500 mt-0.5"
                    />
                    <span
                      className={`flex-1 text-sm ${
                        task.isCompleted
                          ? "line-through text-slate-400"
                          : "text-slate-800 font-medium"
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>

                  {task.dueDate && (
                    <div className="ml-8 mb-3 text-xs text-slate-600 space-y-1">
                      <div>📅 {formatDate(task.dueDate)}</div>
                      <div>🕐 {formatTime(task.dueDate)}</div>
                    </div>
                  )}

                  <div className="ml-8 flex gap-2">
                    <button
                      onClick={() => handleStartEdit(task)}
                      disabled={task.isCompleted}
                      className="flex-1 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs rounded hover:shadow-lg transition duration-200 disabled:opacity-50 transform hover:scale-105"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="flex-1 px-3 py-1.5 bg-gradient-to-r from-red-400 to-red-500 text-white text-xs rounded hover:shadow-lg transition duration-200 transform hover:scale-105"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Edit Project Modal - FIXED */}
      {showEditProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50 backdrop-blur-sm fade-in-animation">
          <div className="bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-2xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto scale-in-animation border border-blue-200">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-full flex items-center justify-center">
                  <span className="text-xl">✏️</span>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-blue-600 bg-clip-text text-transparent">
                  Edit Project
                </h2>
              </div>
              <p className="text-slate-600 text-sm">
                Update your project details
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveProjectEdit();
              }}
              className="space-y-5"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={editProjectName}
                  onChange={(e) => setEditProjectName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition text-slate-800 bg-white hover:border-blue-300"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editProjectDescription}
                  onChange={(e) => setEditProjectDescription(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition text-slate-800 bg-white hover:border-blue-300 resize-none"
                  rows={4}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEditProjectModal}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-slate-300 to-slate-400 text-slate-700 font-semibold rounded-lg hover:shadow-lg transition transform hover:scale-105 duration-300"
                >
                  ✕ Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingProject}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 transition transform hover:scale-105 duration-300 shadow-lg"
                >
                  {isUpdatingProject ? "Saving..." : "✓ Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTaskId && editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50 backdrop-blur-sm fade-in-animation">
          <div className="bg-gradient-to-br from-white via-blue-50 to-slate-50 rounded-2xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto scale-in-animation border border-blue-200">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-full flex items-center justify-center">
                  <span className="text-xl">✏️</span>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-blue-600 bg-clip-text text-transparent">
                  Edit Task
                </h2>
              </div>
              <p className="text-slate-600 text-sm">Update your task details</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveEdit(editingTaskId);
              }}
              className="space-y-5"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, title: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition text-slate-800 bg-white hover:border-blue-300"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  📅 Due Date
                </label>
                <input
                  type="date"
                  value={editTaskDate}
                  onChange={(e) => setEditTaskDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition text-slate-700 bg-white hover:border-blue-300 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  🕐 Time (optional)
                </label>
                <div className="flex gap-2 items-end">
                  <input
                    type="text"
                    value={editTaskTime}
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^\d:]/g, "");
                      if (val.length === 2 && !val.includes(":"))
                        val = val + ":";
                      if (val.length <= 5) setEditTaskTime(val);
                    }}
                    maxLength={5}
                    placeholder="HH:MM"
                    className="flex-1 px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition text-slate-700 bg-white font-mono text-lg font-semibold text-center hover:border-blue-300"
                  />
                  <div className="flex gap-1 bg-gradient-to-r from-blue-100 to-slate-100 p-1 rounded-lg border-2 border-blue-200">
                    <button
                      type="button"
                      onClick={() => setEditTaskPeriod("AM")}
                      className={`px-3 py-2 font-semibold text-sm rounded transition ${
                        editTaskPeriod === "AM"
                          ? "bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-md"
                          : "bg-transparent text-slate-600 hover:text-slate-800"
                      }`}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditTaskPeriod("PM")}
                      className={`px-3 py-2 font-semibold text-sm rounded transition ${
                        editTaskPeriod === "PM"
                          ? "bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-md"
                          : "bg-transparent text-slate-600 hover:text-slate-800"
                      }`}
                    >
                      PM
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-slate-300 to-slate-400 text-slate-700 font-semibold rounded-lg hover:shadow-lg transition transform hover:scale-105 duration-300"
                >
                  ✕ Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-lg transition transform hover:scale-105 duration-300 shadow-lg"
                >
                  ✓ Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50 backdrop-blur-sm fade-in-animation">
          <div className="bg-gradient-to-br from-white via-blue-50 to-slate-50 rounded-2xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto scale-in-animation border border-blue-200">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-200 to-cyan-300 rounded-full flex items-center justify-center float-animation">
                  <span className="text-xl">✨</span>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-blue-600 bg-clip-text text-transparent">
                  Create Task
                </h2>
              </div>
              <p className="text-slate-600 text-sm">
                Add a new task to your project
              </p>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-slate-800 placeholder-slate-400 bg-white hover:border-blue-300"
                  placeholder="e.g., Design Dashboard UI"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  📅 Due Date (optional)
                </label>
                <input
                  type="date"
                  value={newTaskDate}
                  onChange={(e) => setNewTaskDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-slate-700 bg-white font-medium hover:border-blue-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  🕐 Time (optional)
                </label>
                <div className="flex gap-2 items-end">
                  <input
                    type="text"
                    value={newTaskTime}
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^\d:]/g, "");
                      if (val.length === 2 && !val.includes(":"))
                        val = val + ":";
                      if (val.length <= 5) setNewTaskTime(val);
                    }}
                    maxLength={5}
                    placeholder="HH:MM"
                    className="flex-1 px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-slate-700 bg-white font-mono text-lg font-semibold text-center hover:border-blue-300"
                  />
                  <div className="flex gap-1 bg-gradient-to-r from-blue-100 to-slate-100 p-1 rounded-lg border-2 border-blue-200">
                    <button
                      type="button"
                      onClick={() => setNewTaskPeriod("AM")}
                      className={`px-3 py-2 font-semibold text-sm rounded transition ${
                        newTaskPeriod === "AM"
                          ? "bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-md"
                          : "bg-transparent text-slate-600 hover:text-slate-800"
                      }`}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTaskPeriod("PM")}
                      className={`px-3 py-2 font-semibold text-sm rounded transition ${
                        newTaskPeriod === "PM"
                          ? "bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-md"
                          : "bg-transparent text-slate-600 hover:text-slate-800"
                      }`}
                    >
                      PM
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewTask({ title: "", dueDate: "" });
                    setNewTaskDate("");
                    setNewTaskTime("09:00");
                    setNewTaskPeriod("AM");
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-slate-300 to-slate-400 text-slate-700 font-semibold rounded-lg hover:shadow-lg transition transform hover:scale-105 duration-300"
                >
                  ✕ Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-400 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition transform hover:scale-105 duration-300 shadow-lg"
                >
                  {isCreating ? (
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
                      Creating...
                    </span>
                  ) : (
                    "✚ Create"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
