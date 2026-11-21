
import { useEffect, useMemo, useState } from "react";

import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "./services/api";

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialForm = {
    title: "",
    description: "",
    priority: "Medium",
    status: "Pending",
    dueDate: "",
  };

  const [form, setForm] = useState(initialForm);

  // Load tasks
  const loadTasks = async () => {
    try {
      setError("");
      setLoading(true);

      const data = await getTasks();

      const taskList = Array.isArray(data)
        ? data
        : data.tasks || [];

      setTasks(taskList);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to connect to backend. Please check your server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Statistics
  const completed = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const pending = tasks.filter(
    (task) => task.status === "Pending"
  ).length;

  const inProgress = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  // Search and filter
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title?.toLowerCase().includes(search.toLowerCase()) ||
        task.description?.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "All" || task.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [tasks, search, filter]);

  // Open modal
  const openModal = (task = null) => {
    if (task) {
      setEditingId(task._id);

      setForm({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "Medium",
        status: task.status || "Pending",
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().slice(0, 10)
          : "",
      });
    } else {
      setEditingId(null);
      setForm(initialForm);
    }

    setShowModal(true);
  };

  // Form input
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save task
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      alert("Please enter a task title.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingId) {
        await updateTask(editingId, form);
      } else {
        await createTask(form);
      }

      setShowModal(false);
      setForm(initialForm);
      setEditingId(null);

      await loadTasks();

    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save task."
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete task
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) return;

    try {
      await deleteTask(id);
      await loadTasks();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete task."
      );
    }
  };

  // Toggle task status
  const toggleComplete = async (task) => {
    try {
      const newStatus =
        task.status === "Completed" ? "Pending" : "Completed";

      await updateTask(task._id, {
        ...task,
        status: newStatus,
      });

      await loadTasks();

    } catch (err) {
      setError("Unable to update task status.");
    }
  };

  const formatDate = (date) => {
    if (!date) return "No deadline";

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="app-container">

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">D</div>
          <span>DevTask<span className="brand-dot">.</span></span>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="sidebar-nav">
          <a href="#dashboard" className="nav-item active">
            <span>▦</span> Dashboard
          </a>

          <a href="#tasks" className="nav-item">
            <span>☷</span> My Tasks
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="profile-avatar">MT</div>
          <div className="profile-info">
            <strong>My Workspace</strong>
            <span>Personal Account</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content" id="dashboard">

        {/* Header */}
        <header className="topbar">
          <div>
            <p className="breadcrumb">Workspace / Dashboard</p>
            <h1>Dashboard</h1>
          </div>

          <button
            className="primary-btn"
            onClick={() => openModal()}
          >
            <span>＋</span> Add New Task
          </button>
        </header>

        {/* Welcome */}
        <section className="welcome-section">
          <div>
            <p className="welcome-date">
              YOUR PRODUCTIVITY SPACE
            </p>
            <h2>Welcome back! 👋</h2>
            <p>Stay focused and make today productive.</p>
          </div>

          <div className="welcome-decoration">✦</div>
        </section>

        {/* Error */}
        {error && (
          <div className="error-message">
            <span>{error}</span>
            <button onClick={() => setError("")}>✕</button>
          </div>
        )}

        {/* Statistics */}
        <section className="stats-grid">

          <div className="stat-card">
            <div className="stat-icon purple">▤</div>
            <p>Total Tasks</p>
            <h3>{tasks.length}</h3>
            <span>All your tasks</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">◷</div>
            <p>Pending</p>
            <h3>{pending}</h3>
            <span>Waiting to start</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">↗</div>
            <p>In Progress</p>
            <h3>{inProgress}</h3>
            <span>Currently working</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">✓</div>
            <p>Completed</p>
            <h3>{completed}</h3>
            <span>Successfully finished</span>
          </div>

        </section>

        {/* Task Section */}
        <section className="tasks-section" id="tasks">

          <div className="section-heading">
            <div>
              <h2>My Tasks</h2>
              <p>Manage and organize your daily activities.</p>
            </div>

            <span className="task-count">
              {filteredTasks.length} Tasks
            </span>
          </div>

          {/* Search */}
          <div className="toolbar">

            <div className="search-box">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Search your tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

          </div>

          {/* Tasks */}
          {loading ? (
            <div className="empty-state">
              <div className="loader"></div>
              <p>Loading your tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (

            <div className="empty-state">
              <div className="empty-icon">☷</div>
              <h3>No tasks found</h3>
              <p>Create a new task to get started.</p>
              <button
                className="primary-btn"
                onClick={() => openModal()}
              >
                + Create Task
              </button>
            </div>

          ) : (

            <div className="task-list">

              {filteredTasks.map((task) => (

                <article className="task-card" key={task._id}>

                  <div className="task-check">
                    <input
                      type="checkbox"
                      checked={task.status === "Completed"}
                      onChange={() => toggleComplete(task)}
                    />
                  </div>

                  <div className="task-details">
                    <h3 className={
                      task.status === "Completed" ? "completed-title" : ""
                    }>
                      {task.title}
                    </h3>

                    <p>
                      {task.description || "No description provided."}
                    </p>

                    <div className="task-meta">
                      <span className={`priority ${task.priority?.toLowerCase()}`}>
                        {task.priority || "Medium"} Priority
                      </span>

                      <span className="task-date">
                        ◷ {formatDate(task.dueDate)}
                      </span>
                    </div>
                  </div>

                  <div className="task-actions">

                    <span className={`status ${task.status?.toLowerCase().replace(" ", "-")}`}>
                      {task.status}
                    </span>

                    <button
                      className="icon-btn"
                      title="Edit task"
                      onClick={() => openModal(task)}
                    >
                      ✎
                    </button>

                    <button
                      className="icon-btn delete-btn"
                      title="Delete task"
                      onClick={() => handleDelete(task._id)}
                    >
                      🗑
                    </button>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

        <footer className="footer">
          <span>© 2026 DevTask. All rights reserved.</span>
          <span>Built for better productivity ✦</span>
        </footer>

      </main>

      {/* Add / Edit Modal */}
      {showModal && (

        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) {
              setShowModal(false);
            }
          }}
        >

          <div className="modal">

            <div className="modal-header">
              <div>
                <h2>{editingId ? "Edit Task" : "Create New Task"}</h2>
                <p>Fill in the details below.</p>
              </div>

              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
                disabled={saving}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>

              <label>Task Title *</label>
              <input
                type="text"
                name="title"
                placeholder="Enter task title"
                value={form.title}
                onChange={handleChange}
                required
              />

              <label>Description</label>
              <textarea
                name="description"
                placeholder="Describe your task..."
                value={form.description}
                onChange={handleChange}
                rows="4"
              />

              <div className="form-row">

                <div>
                  <label>Priority</label>
                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label>Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

              </div>

              <label>Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
              />

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Task"
                    : "Create Task"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default App;
