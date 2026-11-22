
import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const API = axios.create({
  baseURL: BASE_URL.endsWith("/api")
    ? BASE_URL
    : `${BASE_URL.replace(/\/+$/, "")}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Get all tasks
export const getTasks = async () => {
  const response = await API.get("/tasks");
  return response.data;
};

// Create task
export const createTask = async (taskData) => {
  const response = await API.post("/tasks", taskData);
  return response.data;
};

// Update task
export const updateTask = async (id, taskData) => {
  const response = await API.put(`/tasks/${id}`, taskData);
  return response.data;
};

// Delete task
export const deleteTask = async (id) => {
  const response = await API.delete(`/tasks/${id}`);
  return response.data;
};

export default API;
