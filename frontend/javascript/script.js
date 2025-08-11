document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.getElementById("task");
  const addButton = document.getElementById("add-task");
  const taskDisplay = document.querySelector(".task-display");
  const upcomingTasksList = document.querySelector(".tasks ul");
  const emptyState = document.querySelector(".empty-state");

  // Load tasks (READ)
  const loadTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      const tasks = await response.json();

      // Clear both displays
      taskDisplay.innerHTML = "";
      upcomingTasksList.innerHTML = "";

      // Show empty state only when there are no active tasks
      const activeTasks = tasks.filter((task) => !task.completed);
      emptyState.style.display = activeTasks.length === 0 ? "block" : "none";

      // Display all tasks in main section initially
      tasks.forEach((task) => {
        if (task.completed) {
          addTaskToUpcoming(task);
        } else {
          addTaskToDisplay(task);
        }
      });
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  // Add task to upcoming section
  const addTaskToUpcoming = (task) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <input type="checkbox" class="task-checkbox" checked data-id="${task._id}" />
      <span class="task-title">${task.title}</span>
      <span class="task-status">Completed</span>
    `;

    // Add event listener to checkbox to allow unchecking
    const checkbox = li.querySelector(".task-checkbox");
    checkbox.addEventListener("change", async () => {
      try {
        await updateTaskStatus(task._id, checkbox.checked);
        loadTasks(); // Reload to move task back to active section
      } catch (error) {
        console.error("Error updating task:", error);
        checkbox.checked = !checkbox.checked; // Revert on error
      }
    });

    upcomingTasksList.appendChild(li);
  };

  // Clear input after adding task
  const clearInput = () => {
    taskInput.value = "";
    taskInput.focus();
  };

  // Add task to display
  const addTaskToDisplay = (task) => {
    const taskElement = document.createElement("div");
    taskElement.className = `task-item ${task.completed ? "completed" : ""}`;
    taskElement.innerHTML = `
      <input type="checkbox" 
        class="task-checkbox" 
        ${task.completed ? "checked" : ""} 
        data-id="${task._id}"
      />
      <span>${task.title}</span>
      <div class="task-actions">
        <button class="edit-btn" data-id="${task._id}">
          <i class="fas fa-edit"></i>
        </button>
        <button class="delete-btn" data-id="${task._id}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;

    // Add all event listeners
    const checkbox = taskElement.querySelector(".task-checkbox");
    const editBtn = taskElement.querySelector(".edit-btn");
    const deleteBtn = taskElement.querySelector(".delete-btn");

    // Checkbox event
    checkbox.addEventListener("change", async () => {
      try {
        await updateTaskStatus(task._id, checkbox.checked);
        // Remove the loadTasks() call since updateTaskStatus now handles the UI
      } catch (error) {
        console.error("Error updating task:", error);
        checkbox.checked = !checkbox.checked;
      }
    });

    // Edit button event
    editBtn.addEventListener("click", () => editTask(task._id, task.title));

    // Delete button event
    deleteBtn.addEventListener("click", () => deleteTask(task._id));

    taskDisplay.appendChild(taskElement);
  };

  // Update task status
  const updateTaskStatus = async (id, completed) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed }),
      });

      if (response.ok) {
        const task = await response.json();
        const taskElement = document
          .querySelector(`[data-id="${id}"]`)
          .closest(".task-item");

        if (completed) {
          // Move to completed tasks
          taskElement.remove();
          addTaskToUpcoming(task);
        } else {
          // Move back to active tasks
          const listItem = document
            .querySelector(`li .task-checkbox[data-id="${id}"]`)
            .closest("li");
          listItem.remove();
          addTaskToDisplay(task);
        }

        // Update empty state based on active tasks
        const activeTasksCount = document.querySelectorAll(".task-item").length;
        emptyState.style.display = activeTasksCount === 0 ? "block" : "none";
      }
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  };

  // Create task
  addButton.addEventListener("click", async () => {
    const title = taskInput.value.trim();
    if (!title) return;

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      });
      const task = await response.json();
      addTaskToDisplay(task);
      clearInput();
      emptyState.classList.remove("visible");
    } catch (error) {
      console.error("Error adding task:", error);
    }
  });

  // Edit task
  const editTask = async (id, currentTitle) => {
    const newTitle = prompt("Edit task:", currentTitle);
    if (!newTitle || newTitle === currentTitle) return;

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: newTitle }),
      });
      if (response.ok) {
        loadTasks(); // Refresh the task list
      }
    } catch (error) {
      console.error("Error editing task:", error);
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        loadTasks(); // Refresh the task list
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Initial load
  loadTasks();
});
