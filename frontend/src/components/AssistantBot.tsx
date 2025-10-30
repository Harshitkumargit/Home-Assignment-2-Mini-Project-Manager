import React, { useState, useEffect, useRef } from "react";
import { projectsAPI, tasksAPI } from "../services/api";
import type { Project, Task } from "../types";

interface AssistantBotProps {
  projectCount: number;
  completedCount: number;
  onActionComplete?: () => void;
}

interface FlowState {
  step:
    | "menu"
    | "creating_project"
    | "adding_task"
    | "select_project"
    | "task_name"
    | "task_date"
    | "task_time"
    | "delete_project"
    | "select_delete_project"
    | "delete_task"
    | "select_delete_task_project"
    | "select_delete_task"
    | "deleting"
    | "editing";
  selectedProject?: Project;
  selectedTasks?: Task[];
  taskName?: string;
  taskDate?: string;
  allProjects: Project[];
}

const AssistantBot: React.FC<AssistantBotProps> = ({
  projectCount,
  completedCount,
  onActionComplete,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState<
    Array<{
      type: "bot" | "user";
      text: string;
      buttons?: Array<{ label: string; value: string }>;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [flowState, setFlowState] = useState<FlowState>({
    step: "menu",
    allProjects: [],
  });
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [blushIntensity, setBlushIntensity] = useState(0);
  const [sparkles, setSparkles] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [showGreeting, setShowGreeting] = useState(true);
  const botRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const sparkleIdRef = useRef(0);
  const greetingIntervalRef = useRef<number | null>(null);

  // ✅ ENGAGING GREETING MESSAGES
  const greetings = [
    {
      text: "Hii! 👋 Need help with tasks?",
      emoji: "👋",
      color: "from-blue-400",
    },
    {
      text: "Let's boost productivity! 🚀",
      emoji: "🚀",
      color: "from-purple-400",
    },
    {
      text: "Click to chat with me! 💬",
      emoji: "💬",
      color: "from-pink-400",
    },
    {
      text: "Ready to create tasks? ✨",
      emoji: "✨",
      color: "from-yellow-400",
    },
    {
      text: "I'm here to help! 🤖",
      emoji: "🤖",
      color: "from-cyan-400",
    },
    {
      text: "What's on your mind? 🧠",
      emoji: "🧠",
      color: "from-green-400",
    },
    { text: "Let's get things done! 💪", emoji: "💪", color: "from-red-400" },
    {
      text: "Your AI assistant awaits! ⚡",
      emoji: "⚡",
      color: "from-orange-400",
    },
  ];

  const completionRate =
    projectCount > 0 ? Math.round((completedCount / projectCount) * 100) : 0;

  const addSparkles = () => {
    const newSparkles = Array.from({ length: 8 }).map(() => ({
      id: sparkleIdRef.current++,
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));
    setSparkles(newSparkles);
    setTimeout(() => setSparkles([]), 1500);
  };

  // ✅ ROTATE GREETINGS WHEN CHAT IS CLOSED
  useEffect(() => {
    if (!isChatOpen && showGreeting) {
      greetingIntervalRef.current = setInterval(() => {
        setGreetingIndex((prev) => (prev + 1) % greetings.length);
      }, 4000); // Change greeting every 4 seconds

      return () => {
        if (greetingIntervalRef.current) {
          clearInterval(greetingIntervalRef.current);
        }
      };
    } else {
      if (greetingIntervalRef.current) {
        clearInterval(greetingIntervalRef.current);
      }
    }
  }, [isChatOpen, showGreeting, greetings.length]);

  useEffect(() => {
    if (isChatOpen && messages.length === 0) {
      showMainMenu();
      setShowGreeting(false); // Hide greeting when chat opens
    }
  }, [isChatOpen]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const showMainMenu = async () => {
    const projects = await projectsAPI.getAll().catch(() => []);
    setFlowState({ step: "menu", allProjects: projects });

    const menuMessage = `Welcome to AI Task Assistant! 🤖

I'm here to help you manage your tasks efficiently. What would you like to do?`;

    const buttons = [
      { label: "📁 Create Project", value: "create_project" },
      { label: "✏️ Add Task", value: "add_task" },
      { label: "🗑️ Delete Project", value: "delete_project" },
      { label: "❌ Delete Task", value: "delete_task" },
      { label: "📋 List All Tasks", value: "list_tasks" },
      { label: "📊 Show Progress", value: "show_progress" },
      { label: "💪 Get Motivation", value: "get_motivation" },
    ];

    setMessages([{ type: "bot", text: menuMessage, buttons }]);
  };

  const handleButtonClick = async (value: string) => {
    addSparkles();
    setBlushIntensity(1);
    setIsLoading(true);

    await handleMenuSelection(value);
    setIsLoading(false);

    let intensity = 1;
    const fadeInterval = setInterval(() => {
      intensity -= 0.1;
      setBlushIntensity(Math.max(0, intensity));
      if (intensity <= 0) {
        clearInterval(fadeInterval);
      }
    }, 100);
  };

  const handleMenuSelection = async (value: string) => {
    switch (value) {
      case "create_project":
        setMessages((prev) => [
          ...prev,
          { type: "user", text: "📁 Create Project" },
        ]);
        setFlowState({ ...flowState, step: "creating_project" });
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: "What would you like to name your new project?\n\n💡 Examples: Website Redesign, Mobile App, Marketing Campaign",
            buttons: [],
          },
        ]);
        break;

      case "delete_project":
        const projectsForDelete = await projectsAPI.getAll().catch(() => []);
        if (projectsForDelete.length === 0) {
          setMessages((prev) => [
            ...prev,
            { type: "user", text: "🗑️ Delete Project" },
            {
              type: "bot",
              text: "You don't have any projects yet! 📚\n\nCreate one first to manage your tasks.",
              buttons: [{ label: "Back to Menu", value: "back_to_menu" }],
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            { type: "user", text: "🗑️ Delete Project" },
          ]);
          setFlowState({
            ...flowState,
            step: "select_delete_project",
            allProjects: projectsForDelete,
          });

          const projectButtons = projectsForDelete.map((p, idx) => ({
            label: `${idx + 1}. ${p.title}`,
            value: `delete_proj_${p.id}`,
          }));
          projectButtons.push({ label: "Back to Menu", value: "back_to_menu" });

          setMessages((prev) => [
            ...prev,
            {
              type: "bot",
              text: "⚠️ Select the project you want to delete (This cannot be undone!):",
              buttons: projectButtons,
            },
          ]);
        }
        break;

      case "delete_task":
        const projectsForTaskDelete = await projectsAPI
          .getAll()
          .catch(() => []);
        if (projectsForTaskDelete.length === 0) {
          setMessages((prev) => [
            ...prev,
            { type: "user", text: "❌ Delete Task" },
            {
              type: "bot",
              text: "You don't have any projects yet! 📚\n\nCreate one first to add and delete tasks.",
              buttons: [{ label: "Back to Menu", value: "back_to_menu" }],
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            { type: "user", text: "❌ Delete Task" },
          ]);
          setFlowState({
            ...flowState,
            step: "select_delete_task_project",
            allProjects: projectsForTaskDelete,
          });

          const projectButtons = projectsForTaskDelete.map((p, idx) => ({
            label: `${idx + 1}. ${p.title}`,
            value: `delete_task_project_${p.id}`,
          }));
          projectButtons.push({ label: "Back to Menu", value: "back_to_menu" });

          setMessages((prev) => [
            ...prev,
            {
              type: "bot",
              text: "Select which project's task you want to delete:",
              buttons: projectButtons,
            },
          ]);
        }
        break;

      case "add_task":
        const projects = await projectsAPI.getAll().catch(() => []);
        if (projects.length === 0) {
          setMessages((prev) => [
            ...prev,
            { type: "user", text: "✏️ Add Task" },
            {
              type: "bot",
              text: "You don't have any projects yet! 📚\n\nCreate a project first to add tasks. Would you like to create one?",
              buttons: [
                { label: "Create Project", value: "create_project" },
                { label: "Back to Menu", value: "back_to_menu" },
              ],
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            { type: "user", text: "✏️ Add Task" },
          ]);
          setFlowState({
            ...flowState,
            step: "select_project",
            allProjects: projects,
          });

          const projectButtons = projects.map((p, idx) => ({
            label: `${idx + 1}. ${p.title}`,
            value: `project_${p.id}`,
          }));
          projectButtons.push({ label: "Back to Menu", value: "back_to_menu" });

          setMessages((prev) => [
            ...prev,
            {
              type: "bot",
              text: "Which project would you like to add a task to?",
              buttons: projectButtons,
            },
          ]);
        }
        break;

      case "list_tasks":
        setMessages((prev) => [
          ...prev,
          { type: "user", text: "📋 List All Tasks" },
        ]);
        const allProjects = await projectsAPI.getAll().catch(() => []);
        let taskList = "Here are all your tasks:\n\n";

        if (allProjects.length === 0) {
          taskList = "You have no projects yet! 📚";
        } else {
          for (const project of allProjects) {
            taskList += `📁 ${project.title}\n`;
            try {
              const tasks = await tasksAPI.getAll(project.id);
              if (tasks.length === 0) {
                taskList += "   (No tasks)\n";
              } else {
                tasks.forEach((task, idx) => {
                  taskList += `   ${idx + 1}. ${task.title} ${
                    task.isCompleted ? "✅" : "⏳"
                  }\n`;
                });
              }
            } catch (err) {
              taskList += "   (Error loading tasks)\n";
            }
            taskList += "\n";
          }
        }

        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: taskList,
            buttons: [{ label: "Back to Menu", value: "back_to_menu" }],
          },
        ]);
        break;

      case "show_progress":
        setMessages((prev) => [
          ...prev,
          { type: "user", text: "📊 Show Progress" },
          {
            type: "bot",
            text: `Your Progress Report:\n\n✅ Completed: ${completedCount}/${projectCount} projects\n📈 Completion Rate: ${completionRate}%\n\n${
              completionRate === 100
                ? "🏆 Amazing! You've completed all projects!"
                : completionRate >= 75
                ? "🌟 Excellent progress! Keep it up!"
                : completionRate >= 50
                ? "💪 Good work! You're halfway there!"
                : "🚀 You're getting started! Keep pushing!"
            }`,
            buttons: [{ label: "Back to Menu", value: "back_to_menu" }],
          },
        ]);
        break;

      case "get_motivation":
        const motivations = [
          `You're crushing it! With ${completionRate}% completion, keep this momentum going! 🚀`,
          "Every project completed is a victory! You're doing amazing! 💪",
          "Your dedication is inspiring! Stay focused and you'll achieve everything! ⭐",
          "You're a productivity superstar! Keep shining! ✨",
          "Nothing can stop you! Keep building those wins! 🔥",
        ];
        const randomMotivation =
          motivations[Math.floor(Math.random() * motivations.length)];
        setMessages((prev) => [
          ...prev,
          { type: "user", text: "💪 Get Motivation" },
          {
            type: "bot",
            text: randomMotivation,
            buttons: [{ label: "Back to Menu", value: "back_to_menu" }],
          },
        ]);
        break;

      case "back_to_menu":
        showMainMenu();
        break;

      default:
        if (value.startsWith("project_")) {
          const selectedId = parseInt(value.replace("project_", ""));
          const selected = flowState.allProjects.find(
            (p) => p.id === selectedId
          );
          if (selected) {
            setMessages((prev) => [
              ...prev,
              { type: "user", text: `Selected: ${selected.title}` },
            ]);
            setFlowState({
              ...flowState,
              step: "task_name",
              selectedProject: selected,
            });
            setMessages((prev) => [
              ...prev,
              {
                type: "bot",
                text: `What would you like to name this task?\n\n💡 Examples: Design UI, Write Documentation, Setup Database`,
                buttons: [],
              },
            ]);
          }
        } else if (value.startsWith("delete_proj_")) {
          const selectedId = parseInt(value.replace("delete_proj_", ""));
          const selected = flowState.allProjects.find(
            (p) => p.id === selectedId
          );
          if (selected) {
            setMessages((prev) => [
              ...prev,
              { type: "user", text: `Delete: ${selected.title}` },
            ]);

            try {
              await projectsAPI.delete(selectedId);
              setMessages((prev) => [
                ...prev,
                {
                  type: "bot",
                  text: `✅ Project "${selected.title}" has been deleted successfully!\n\nWhat would you like to do next?`,
                  buttons: [{ label: "Back to Menu", value: "back_to_menu" }],
                },
              ]);
              addSparkles();
              onActionComplete?.();
            } catch (err) {
              setMessages((prev) => [
                ...prev,
                {
                  type: "bot",
                  text: "⚠️ Error deleting project. Please try again.",
                  buttons: [{ label: "Back to Menu", value: "back_to_menu" }],
                },
              ]);
            }
          }
        } else if (value.startsWith("delete_task_project_")) {
          const selectedId = parseInt(
            value.replace("delete_task_project_", "")
          );
          const selected = flowState.allProjects.find(
            (p) => p.id === selectedId
          );
          if (selected) {
            try {
              const tasks = await tasksAPI.getAll(selectedId);
              if (tasks.length === 0) {
                setMessages((prev) => [
                  ...prev,
                  {
                    type: "bot",
                    text: `No tasks in "${selected.title}" to delete! 📚`,
                    buttons: [{ label: "Back to Menu", value: "back_to_menu" }],
                  },
                ]);
              } else {
                setFlowState({
                  ...flowState,
                  step: "select_delete_task",
                  selectedProject: selected,
                  selectedTasks: tasks,
                });

                const taskButtons = tasks.map((t, idx) => ({
                  label: `${idx + 1}. ${t.title}`,
                  value: `delete_task_${t.id}`,
                }));
                taskButtons.push({
                  label: "Back to Menu",
                  value: "back_to_menu",
                });

                setMessages((prev) => [
                  ...prev,
                  {
                    type: "bot",
                    text: `Select which task in "${selected.title}" you want to delete:`,
                    buttons: taskButtons,
                  },
                ]);
              }
            } catch (err) {
              setMessages((prev) => [
                ...prev,
                {
                  type: "bot",
                  text: "⚠️ Error loading tasks. Please try again.",
                  buttons: [{ label: "Back to Menu", value: "back_to_menu" }],
                },
              ]);
            }
          }
        } else if (value.startsWith("delete_task_")) {
          const taskId = parseInt(value.replace("delete_task_", ""));

          try {
            await tasksAPI.delete(taskId);
            setMessages((prev) => [
              ...prev,
              {
                type: "bot",
                text: `✅ Task has been deleted successfully!\n\nWhat would you like to do next?`,
                buttons: [
                  { label: "Delete More Tasks", value: "delete_task" },
                  { label: "Back to Menu", value: "back_to_menu" },
                ],
              },
            ]);
            addSparkles();
            onActionComplete?.();
          } catch (err) {
            setMessages((prev) => [
              ...prev,
              {
                type: "bot",
                text: "⚠️ Error deleting task. Please try again.",
                buttons: [{ label: "Back to Menu", value: "back_to_menu" }],
              },
            ]);
          }
        }
    }
  };

  const handleSendMessage = async () => {
    if (
      !userInput.trim() &&
      flowState.step !== "task_date" &&
      flowState.step !== "task_time"
    ) {
      return;
    }

    const currentInput = userInput;
    setUserInput("");

    if (currentInput.trim()) {
      setMessages((prev) => [...prev, { type: "user", text: currentInput }]);
    }

    setBlushIntensity(1);
    addSparkles();
    setIsLoading(true);

    try {
      if (flowState.step === "creating_project") {
        const projectName = currentInput.trim();
        if (!projectName) {
          setMessages((prev) => [
            ...prev,
            {
              type: "bot",
              text: "❌ Project name cannot be empty. Please try again.",
              buttons: [{ label: "Back to Menu", value: "back_to_menu" }],
            },
          ]);
        } else {
          await projectsAPI.create({
            title: projectName,
            description: `Created with AI Assistant on ${new Date().toLocaleDateString()}`,
          });

          setMessages((prev) => [
            ...prev,
            {
              type: "bot",
              text: `🎉 Perfect! Project "${projectName}" has been created!\n\nYou can now add tasks to this project. What would you like to do next?`,
              buttons: [
                { label: "Add Task", value: "add_task" },
                { label: "Back to Menu", value: "back_to_menu" },
              ],
            },
          ]);

          addSparkles();
          setFlowState({ ...flowState, step: "menu" });
          onActionComplete?.();
        }
      } else if (
        flowState.step === "task_name" &&
        flowState.taskName === undefined
      ) {
        const taskName = currentInput.trim();
        if (!taskName) {
          setMessages((prev) => [
            ...prev,
            {
              type: "bot",
              text: "❌ Task name cannot be empty. Please try again.",
              buttons: [],
            },
          ]);
        } else {
          setFlowState({
            ...flowState,
            step: "task_date",
            taskName,
          });
          setMessages((prev) => [
            ...prev,
            {
              type: "bot",
              text: `When is the due date?\n\n📅 Format: YYYY-MM-DD (e.g., 2025-12-31)\n\nOr just send to skip this step ⏭️`,
              buttons: [],
            },
          ]);
        }
      } else if (flowState.step === "task_date" && flowState.taskName) {
        const dateInput = currentInput.trim();
        setFlowState({
          ...flowState,
          step: "task_time",
          taskDate: dateInput || undefined,
        });
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: `What time should this task be due?\n\n⏰ Format: HH:MM (e.g., 14:30)\n\nOr just send to skip this step ⏭️`,
            buttons: [],
          },
        ]);
      } else if (
        flowState.step === "task_time" &&
        flowState.taskName &&
        flowState.selectedProject
      ) {
        const timeInput = currentInput.trim();
        let dueDateTime: string | null | undefined = undefined;

        if (flowState.taskDate) {
          if (timeInput) {
            dueDateTime = `${flowState.taskDate}T${timeInput}:00`;
          } else {
            dueDateTime = `${flowState.taskDate}T00:00:00`;
          }
        }

        const selectedProject = flowState.selectedProject;
        const taskName = flowState.taskName;

        try {
          await tasksAPI.create(selectedProject.id, {
            title: taskName,
            dueDate: dueDateTime || undefined,
          } as any);

          const dueDateText = dueDateTime
            ? `\n⏰ Due: ${dueDateTime}`
            : "\n📅 No due date set";

          setMessages((prev) => [
            ...prev,
            {
              type: "bot",
              text: `✅ Awesome! Task "${taskName}" has been added to "${selectedProject.title}"${dueDateText}\n\nKeep up the great work! What's next?`,
              buttons: [
                { label: "Add Another Task", value: "add_task" },
                { label: "Back to Menu", value: "back_to_menu" },
              ],
            },
          ]);

          addSparkles();
          setFlowState({ step: "menu", allProjects: flowState.allProjects });
          onActionComplete?.();
        } catch (error) {
          console.error("Error adding task:", error);
          setMessages((prev) => [
            ...prev,
            {
              type: "bot",
              text: "⚠️ Error adding task. Please try again.",
              buttons: [{ label: "Back to Menu", value: "back_to_menu" }],
            },
          ]);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: "⚠️ An error occurred. Please try again.",
          buttons: [{ label: "Back to Menu", value: "back_to_menu" }],
        },
      ]);
    }

    setIsLoading(false);

    let intensity = 1;
    const fadeInterval = setInterval(() => {
      intensity -= 0.1;
      setBlushIntensity(Math.max(0, intensity));
      if (intensity <= 0) {
        clearInterval(fadeInterval);
      }
    }, 100);
  };

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!botRef.current) return;

      const botRect = botRef.current.getBoundingClientRect();
      const botCenterX = botRect.left + botRect.width / 2;
      const botCenterY = botRect.top + botRect.height / 2;

      const angle = Math.atan2(e.clientY - botCenterY, e.clientX - botCenterX);
      const distance = 10;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      setEyePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed bottom-8 right-8 z-40 flex flex-col items-end gap-3">
      <style>{`
        @keyframes float-animation {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.8), inset 0 0 20px rgba(255, 255, 255, 0.5); }
          70% { box-shadow: 0 0 0 20px rgba(59, 130, 246, 0), inset 0 0 20px rgba(255, 255, 255, 0.5); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0), inset 0 0 20px rgba(255, 255, 255, 0.5); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shine {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
        @keyframes typing {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes sparkle-burst {
          0% { opacity: 1; transform: translate(0, 0) scale(1); }
          100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(0); }
        }
        @keyframes gradient-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.05); }
        }
        @keyframes pulse-text {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .bot-float { animation: float-animation 3s ease-in-out infinite; }
        .bot-pulse { animation: pulse-ring 2.5s infinite; }
        .slide-up { animation: slide-in 0.4s ease-out; }
        .shine { animation: shine 2s ease-in-out infinite; }
        .typing-dots { animation: typing 1s ease-in-out infinite; }
        .sparkle { animation: sparkle-burst 1.5s ease-out forwards; }
        .gradient-flow { animation: gradient-flow 6s ease infinite; background-size: 200% 200%; }
        .bounce-gentle { animation: bounce-gentle 2s ease-in-out infinite; }
        .pulse-text { animation: pulse-text 2s ease-in-out infinite; }
        
        /* ✅ CUSTOM SCROLLBAR */
        .scrollbar-custom::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-custom::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: #93c5fd;
          border-radius: 10px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: #60a5fa;
        }
      `}</style>

      {/* Chat Window - SCROLLABLE */}
      {isChatOpen && (
        <div className="slide-up bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-3xl shadow-2xl w-96 max-w-[90vw] max-h-[70vh] flex flex-col border-3 border-gradient-to-r from-blue-300 to-purple-300 overflow-hidden md:w-96 sm:w-80">
          {/* Header - FIXED */}
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white p-4 font-bold text-lg flex items-center justify-between shadow-xl flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="text-3xl animate-bounce">🤖</div>
              <div>
                <span className="text-lg">AI Task Assistant</span>
                <p className="text-xs opacity-90">Always here to help ✨</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsChatOpen(false);
                setMessages([]);
                setShowGreeting(true); // Show greeting again when closing
              }}
              className="text-2xl hover:scale-125 transition duration-200 hover:rotate-90"
            >
              ✕
            </button>
          </div>

          {/* Messages - SCROLLABLE AREA */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent via-blue-50 to-purple-50 scrollbar-custom"
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.type === "user" ? "justify-end" : "justify-start"
                } animate-fade-in`}
              >
                <div className={msg.type === "user" ? "" : "w-full"}>
                  <div
                    className={`max-w-xs px-5 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 ${
                      msg.type === "user"
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-none shadow-lg hover:shadow-xl"
                        : "bg-white border-2 border-blue-200 text-slate-800 rounded-bl-none shadow-md hover:shadow-lg whitespace-pre-wrap border-l-4 border-l-purple-500"
                    }`}
                  >
                    {msg.text}
                  </div>

                  {msg.buttons &&
                    msg.buttons.length > 0 &&
                    msg.type === "bot" && (
                      <div className="mt-3 flex flex-col gap-2 px-2 animate-fade-in max-h-[200px] overflow-y-auto scrollbar-custom">
                        {msg.buttons.map((btn, btnIdx) => (
                          <button
                            key={btnIdx}
                            onClick={() => handleButtonClick(btn.value)}
                            disabled={isLoading}
                            className="w-full px-4 py-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-white font-bold rounded-xl hover:shadow-xl transform hover:scale-105 transition duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:from-blue-500 hover:via-purple-500 hover:to-pink-500"
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-white border-2 border-blue-300 text-slate-800 rounded-2xl rounded-bl-none shadow-md px-5 py-3 flex gap-2 border-l-4 border-l-purple-500">
                  <span className="typing-dots text-lg">●</span>
                  <span
                    className="typing-dots text-lg"
                    style={{ animationDelay: "0.2s" }}
                  >
                    ●
                  </span>
                  <span
                    className="typing-dots text-lg"
                    style={{ animationDelay: "0.4s" }}
                  >
                    ●
                  </span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Area - FIXED AT BOTTOM */}
          {(flowState.step === "creating_project" ||
            flowState.step === "task_name" ||
            flowState.step === "task_date" ||
            flowState.step === "task_time") && (
            <div className="border-t-3 border-gradient-to-r from-blue-300 to-purple-300 p-3 bg-gradient-to-r from-blue-50 to-purple-50 flex gap-2 shadow-inner flex-shrink-0">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder={
                  flowState.step === "creating_project"
                    ? "Enter project name..."
                    : flowState.step === "task_name"
                    ? "Enter task name..."
                    : flowState.step === "task_date"
                    ? "YYYY-MM-DD or press send to skip..."
                    : "HH:MM or press send to skip..."
                }
                className="flex-1 px-4 py-3 border-2 border-blue-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition font-semibold text-sm hover:border-blue-300 bg-white"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading}
                className="px-5 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full hover:shadow-lg transform hover:scale-110 transition duration-200 font-bold text-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                title="Send message"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16346273 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.837654326,3.0486314 1.15159189,3.99701575 L3.03521743,10.4380088 C3.03521743,10.5951061 3.19218622,10.7522035 3.50612381,10.7522035 L16.6915026,11.5376905 C16.6915026,11.5376905 17.1624089,11.5376905 17.1624089,12.0089826 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ✅ ENGAGING GREETING MESSAGES - SHOWS WHEN CHAT NOT OPEN */}
      {!isChatOpen && showGreeting && (
        <div className="slide-up bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-2xl shadow-xl p-4 border-2 border-blue-200 hover:shadow-2xl transition duration-300 hover:-translate-y-1 cursor-pointer hidden sm:block max-w-xs">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent pulse-text">
                {greetings[greetingIndex].text}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {projectCount > 0 && `${completionRate}% complete • `}Click to
                start! 👇
              </p>
            </div>
            <div className="text-3xl bounce-gentle">
              {greetings[greetingIndex].emoji}
            </div>
          </div>
        </div>
      )}

      {/* Bot Character */}
      <div ref={botRef} className="bot-float relative w-fit">
        {sparkles.map((sparkle) => (
          <div
            key={sparkle.id}
            className="sparkle absolute text-xl pointer-events-none"
            style={
              {
                left: `${sparkle.x}%`,
                top: `${sparkle.y}%`,
                "--tx": `${(Math.random() - 0.5) * 100}px`,
                "--ty": `${(Math.random() - 0.5) * 100}px`,
              } as React.CSSProperties
            }
          >
            ✨
          </div>
        ))}

        <button
          onClick={() => {
            setIsChatOpen(!isChatOpen);
            setShowGreeting(false);
          }}
          className={`bot-pulse w-32 h-32 bg-gradient-to-br from-blue-300 via-purple-400 to-pink-500 rounded-full shadow-2xl flex items-center justify-center hover:scale-125 ${
            isChatOpen ? "scale-110" : ""
          } transition-all duration-300 cursor-pointer border-4 border-white relative group`}
        >
          <div className="shine absolute top-4 left-6 w-12 h-12 bg-white rounded-full opacity-30 blur-lg"></div>

          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            {/* Eyes */}
            <div className="flex items-center justify-center gap-7 mb-3">
              <div className="relative w-7 h-8 bg-white rounded-full shadow-lg border border-gray-100">
                {isBlinking ? (
                  <div className="absolute inset-0 bg-gray-800 rounded-full"></div>
                ) : (
                  <div
                    className="absolute w-4 h-5 bg-gray-900 rounded-full top-1/2 left-1/2 transition-all duration-75"
                    style={{
                      transform: `translate(calc(-50% + ${
                        eyePosition.x * 0.8
                      }px), calc(-50% + ${eyePosition.y * 0.8}px))`,
                    }}
                  >
                    <div className="absolute w-2 h-2 bg-white rounded-full top-1 left-1 opacity-90"></div>
                  </div>
                )}
              </div>

              <div className="relative w-7 h-8 bg-white rounded-full shadow-lg border border-gray-100">
                {isBlinking ? (
                  <div className="absolute inset-0 bg-gray-800 rounded-full"></div>
                ) : (
                  <div
                    className="absolute w-4 h-5 bg-gray-900 rounded-full top-1/2 left-1/2 transition-all duration-75"
                    style={{
                      transform: `translate(calc(-50% + ${
                        eyePosition.x * 0.8
                      }px), calc(-50% + ${eyePosition.y * 0.8}px))`,
                    }}
                  >
                    <div className="absolute w-2 h-2 bg-white rounded-full top-1 left-1 opacity-90"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Blush */}
            <div
              className="absolute left-6 top-12 w-8 h-6 bg-pink-400 rounded-full blur-md transition-all duration-300"
              style={{
                opacity: blushIntensity * 0.6,
                transform: `scale(${1 + blushIntensity * 0.3})`,
              }}
            ></div>

            <div
              className="absolute right-6 top-12 w-8 h-6 bg-pink-400 rounded-full blur-md transition-all duration-300"
              style={{
                opacity: blushIntensity * 0.6,
                transform: `scale(${1 + blushIntensity * 0.3})`,
              }}
            ></div>

            {/* MOUTH - HAPPY BIG CURVED SMILE */}
            <div className="absolute bottom-4">
              <svg width="50" height="16" viewBox="0 0 50 16" fill="none">
                <path
                  d="M10 2 Q25 12 40 2"
                  stroke="#333"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
          </div>
        </button>

        <div className="absolute -top-3 -right-1 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center animate-pulse">
          <span className="text-lg font-bold">✓</span>
        </div>
      </div>

      {!isChatOpen && (
        <div className="slide-up bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-2xl shadow-lg p-4 border-2 border-blue-200 hidden sm:block hover:shadow-xl transition duration-300 hover:-translate-y-1">
          <div className="text-center">
            <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {projectCount}
            </p>
            <p className="text-xs text-slate-600 font-semibold">Projects</p>
            <div className="mt-3 w-20 h-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full transition-all duration-500 shadow-lg"
                style={{
                  width:
                    projectCount > 0
                      ? `${Math.min(
                          (completedCount / projectCount) * 100,
                          100
                        )}%`
                      : "0%",
                }}
              ></div>
            </div>
            <p className="text-xs text-slate-600 mt-2 font-semibold">
              {completionRate}% complete
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssistantBot;
