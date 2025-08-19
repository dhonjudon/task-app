document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.getElementById("task");
  const addButton = document.getElementById("add-task");
  const taskDisplay = document.querySelector(".task-display");
  const upcomingTasksList = document.querySelector(".tasks ul");
  const emptyState = document.querySelector(".empty-state");

  // Modal elements
  const modalOverlay = document.getElementById("modal-overlay");
  const modalTitle = document.getElementById("modal-title");
  const modalMessage = document.getElementById("modal-message");
  const modalInput = document.getElementById("modal-input");
  const modalCancel = document.getElementById("modal-cancel");
  const modalConfirm = document.getElementById("modal-confirm");
  const modalClose = document.querySelector(".modal-close");

  // Task creation modal elements
  const taskModalOverlay = document.getElementById("task-modal-overlay");
  const taskModalClose = document.getElementById("task-modal-close");
  const taskModalCancel = document.getElementById("task-modal-cancel");
  const taskModalSave = document.getElementById("task-modal-save");
  const taskTitle = document.getElementById("task-title");
  const taskDescription = document.getElementById("task-description");
  const taskCategory = document.getElementById("task-category");
  const taskDueDate = document.getElementById("task-due-date");
  const taskPriority = document.getElementById("task-priority");

  // New category elements
  const newCategoryFields = document.getElementById("new-category-fields");
  const newCategoryName = document.getElementById("new-category-name");
  const newCategoryColor = document.getElementById("new-category-color");
  const saveCategoryBtn = document.getElementById("save-category-btn");
  const cancelCategoryBtn = document.getElementById("cancel-category-btn");

  // Task view modal elements
  const taskViewModalOverlay = document.getElementById(
    "task-view-modal-overlay"
  );
  const taskViewModalClose = document.getElementById("task-view-modal-close");
  const taskViewModalCloseBtn = document.getElementById(
    "task-view-modal-close-btn"
  );
  const taskViewModalEdit = document.getElementById("task-view-modal-edit");
  const viewTaskTitle = document.getElementById("view-task-title");
  const viewTaskDescription = document.getElementById("view-task-description");
  const viewTaskCategory = document.getElementById("view-task-category");
  const viewTaskDueDate = document.getElementById("view-task-due-date");
  const viewTaskPriority = document.getElementById("view-task-priority");
  const viewTaskStatus = document.getElementById("view-task-status");
  const viewTaskCreated = document.getElementById("view-task-created");

  // Store categories and current viewing task
  let categories = [];
  let currentViewingTask = null;

  // Modal functions
  const showModal = (title, message, showInput = false, inputValue = "") => {
    return new Promise((resolve) => {
      modalTitle.textContent = title;
      modalMessage.textContent = message;

      if (showInput) {
        modalInput.style.display = "block";
        modalInput.value = inputValue;
        modalInput.focus();
      } else {
        modalInput.style.display = "none";
      }

      modalOverlay.classList.add("active");

      const handleConfirm = () => {
        const result = showInput ? modalInput.value.trim() : true;
        closeModal();
        resolve(result);
      };

      const handleCancel = () => {
        closeModal();
        resolve(null);
      };

      // Remove any existing event listeners
      modalConfirm.onclick = handleConfirm;
      modalCancel.onclick = handleCancel;
      modalClose.onclick = handleCancel;

      // Handle Enter key for input
      if (showInput) {
        modalInput.onkeypress = (e) => {
          if (e.key === "Enter") {
            handleConfirm();
          }
        };
      }

      // Handle Escape key
      const handleEscape = (e) => {
        if (e.key === "Escape") {
          handleCancel();
          document.removeEventListener("keydown", handleEscape);
        }
      };
      document.addEventListener("keydown", handleEscape);

      // Handle click outside modal
      modalOverlay.onclick = (e) => {
        if (e.target === modalOverlay) {
          handleCancel();
        }
      };
    });
  };

  const closeModal = () => {
    modalOverlay.classList.remove("active");
  };

  // Custom confirm function
  const customConfirm = (message, title = "Confirm") => {
    return showModal(title, message, false);
  };

  // Custom prompt function
  const customPrompt = (message, defaultValue = "", title = "Input") => {
    return showModal(title, message, true, defaultValue);
  };

  // Load categories
  const loadCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      categories = await response.json();

      // Create default categories if none exist
      if (categories.length === 0) {
        await createDefaultCategories();
        const response2 = await fetch("/api/categories");
        categories = await response2.json();
      }

      updateCategorySelect();
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  // Create default categories
  const createDefaultCategories = async () => {
    const defaultCategories = [
      { name: "Work", description: "Work-related tasks", color: "#007bff" },
      { name: "Personal", description: "Personal tasks", color: "#28a745" },
      {
        name: "Shopping",
        description: "Shopping list items",
        color: "#ffc107",
      },
      { name: "Health", description: "Health and fitness", color: "#dc3545" },
    ];

    for (const category of defaultCategories) {
      try {
        await fetch("/api/categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(category),
        });
      } catch (error) {
        console.error("Error creating default category:", error);
      }
    }
  };

  // Update category select dropdown
  const updateCategorySelect = () => {
    taskCategory.innerHTML = '<option value="">No Category</option>';
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category._id;
      option.textContent = category.name;
      taskCategory.appendChild(option);
    });
    // Add create new category option
    const createOption = document.createElement("option");
    createOption.value = "create-new";
    createOption.textContent = "+ Create New Category";
    taskCategory.appendChild(createOption);
  };

  // Show task creation modal
  const showTaskModal = () => {
    // Reset form fields
    taskTitle.value = "";
    taskDescription.value = "";
    taskCategory.value = "";
    taskDueDate.value = "";
    taskPriority.value = "medium";
    newCategoryFields.style.display = "none";

    // Reset modal for creating new task
    document.querySelector("#task-modal-overlay .modal-header h3").textContent =
      "Add New Task";
    taskModalSave.textContent = "Add Task";
    delete taskModalSave.dataset.editingId;

    taskModalOverlay.classList.add("active");
    taskTitle.focus();
  };

  // Close task creation modal
  const closeTaskModal = () => {
    taskModalOverlay.classList.remove("active");
    newCategoryFields.style.display = "none";

    // Reset modal state
    document.querySelector("#task-modal-overlay .modal-header h3").textContent =
      "Add New Task";
    taskModalSave.textContent = "Add Task";
    delete taskModalSave.dataset.editingId;
  };

  // Show task view modal
  const showTaskViewModal = (task) => {
    currentViewingTask = task;

    // Populate task details
    viewTaskTitle.textContent = task.title;

    viewTaskDescription.textContent = task.description || "No description";
    viewTaskDescription.className = task.description
      ? "view-value"
      : "view-value empty";

    if (task.category) {
      viewTaskCategory.innerHTML = `<span class="task-category" style="background-color: ${
        task.category.color || "#007bff"
      }">${task.category.name}</span>`;
    } else {
      viewTaskCategory.textContent = "No category";
      viewTaskCategory.className = "view-value empty";
    }

    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const isOverdue = dueDate < new Date() && !task.completed;
      viewTaskDueDate.innerHTML = `${dueDate.toLocaleDateString()} ${
        isOverdue ? '<span style="color: #dc3545;">(Overdue)</span>' : ""
      }`;
    } else {
      viewTaskDueDate.textContent = "No due date";
      viewTaskDueDate.className = "view-value empty";
    }

    viewTaskPriority.innerHTML = `<span class="priority-badge priority-${
      task.priority || "medium"
    }">${(task.priority || "medium").toUpperCase()}</span>`;

    viewTaskStatus.innerHTML = `<span class="status-badge ${
      task.completed ? "completed" : "pending"
    }">${task.completed ? "Completed" : "Pending"}</span>`;

    const createdDate = new Date(task.date);
    viewTaskCreated.textContent =
      createdDate.toLocaleDateString() +
      " at " +
      createdDate.toLocaleTimeString();

    taskViewModalOverlay.classList.add("active");
  };

  // Close task view modal
  const closeTaskViewModal = () => {
    taskViewModalOverlay.classList.remove("active");
    currentViewingTask = null;
  };

  // Task view modal event listeners
  taskViewModalClose.addEventListener("click", closeTaskViewModal);
  taskViewModalCloseBtn.addEventListener("click", closeTaskViewModal);

  taskViewModalEdit.addEventListener("click", () => {
    if (currentViewingTask) {
      closeTaskViewModal();
      editTask(currentViewingTask._id);
    }
  });

  // Handle category selection change
  taskCategory.addEventListener("change", () => {
    if (taskCategory.value === "create-new") {
      newCategoryFields.style.display = "block";
      newCategoryName.focus();
    } else {
      newCategoryFields.style.display = "none";
    }
  });

  // Save new category
  saveCategoryBtn.addEventListener("click", async () => {
    const name = newCategoryName.value.trim();
    const color = newCategoryColor.value;

    if (!name) {
      alert("Please enter a category name");
      return;
    }

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description: `Custom category: ${name}`,
          color,
        }),
      });

      if (response.ok) {
        const newCategory = await response.json();
        categories.push(newCategory);
        updateCategorySelect();
        taskCategory.value = newCategory._id;
        newCategoryFields.style.display = "none";
        newCategoryName.value = "";
        newCategoryColor.value = "#007bff";
      }
    } catch (error) {
      console.error("Error creating category:", error);
    }
  });

  // Cancel new category
  cancelCategoryBtn.addEventListener("click", () => {
    taskCategory.value = "";
    newCategoryFields.style.display = "none";
    newCategoryName.value = "";
    newCategoryColor.value = "#007bff";
  });

  // Task modal event listeners
  taskModalClose.addEventListener("click", closeTaskModal);
  taskModalCancel.addEventListener("click", closeTaskModal);

  taskModalSave.addEventListener("click", async () => {
    const title = taskTitle.value.trim();
    if (!title) {
      alert("Please enter a task title");
      return;
    }

    // Don't allow saving if creating new category
    if (taskCategory.value === "create-new") {
      alert("Please save the new category first or select a different option");
      return;
    }

    try {
      const taskData = {
        title,
        description: taskDescription.value.trim(),
        category: taskCategory.value || null,
        dueDate: taskDueDate.value || null,
        priority: taskPriority.value,
      };

      const isEditing = taskModalSave.dataset.editingId;
      const url = isEditing ? `/api/tasks/${isEditing}` : "/api/tasks";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        const task = await response.json();

        if (isEditing) {
          // Refresh the entire task list for updates
          loadTasks();
        } else {
          // Add new task to display
          addTaskToDisplay(task);
          emptyState.classList.remove("visible");
        }

        closeTaskModal();

        // Reset modal for next use
        document.querySelector(
          "#task-modal-overlay .modal-header h3"
        ).textContent = "Add New Task";
        taskModalSave.textContent = "Add Task";
        delete taskModalSave.dataset.editingId;
      }
    } catch (error) {
      console.error("Error saving task:", error);
    }
  });

  // Update add button to show modal instead of direct creation
  addButton.addEventListener("click", showTaskModal); // Load tasks (READ)
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
      <div class="completed-task-actions">
        <button class="view-btn small" data-id="${task._id}" title="View Task">
          <i class="fas fa-eye"></i>
        </button>
      </div>
    `;

    // Add event listeners
    const checkbox = li.querySelector(".task-checkbox");
    const viewBtn = li.querySelector(".view-btn");

    // Checkbox event to allow unchecking
    checkbox.addEventListener("change", async () => {
      try {
        await updateTaskStatus(task._id, checkbox.checked);
        loadTasks(); // Reload to move task back to active section
      } catch (error) {
        console.error("Error updating task:", error);
        checkbox.checked = !checkbox.checked; // Revert on error
      }
    });

    // View button event
    viewBtn.addEventListener("click", () => showTaskViewModal(task));

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
    taskElement.className = `task-item ${
      task.completed ? "completed" : ""
    } priority-${task.priority || "medium"}`;

    // Format due date
    let dueDateHtml = "";
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      const isOverdue = dueDate < today && !task.completed;

      dueDateHtml = `<span class="task-due-date ${isOverdue ? "overdue" : ""}">
        📅 ${dueDate.toLocaleDateString()}
      </span>`;
    }

    // Format category
    let categoryHtml = "";
    if (task.category) {
      categoryHtml = `<span class="task-category" style="background-color: ${
        task.category.color || "#007bff"
      }">
        ${task.category.name}
      </span>`;
    }

    taskElement.innerHTML = `
      <input type="checkbox" 
        class="task-checkbox" 
        ${task.completed ? "checked" : ""} 
        data-id="${task._id}"
      />
      <div class="task-content">
        <span class="task-title">${task.title}</span>
        ${
          task.description
            ? `<div class="task-description">${task.description}</div>`
            : ""
        }
        <div class="task-meta">
          ${categoryHtml}
          ${dueDateHtml}
          <span class="task-priority priority-${task.priority || "medium"}">
            ${task.priority ? task.priority.toUpperCase() : "MEDIUM"}
          </span>
        </div>
      </div>
      <div class="task-actions">
        <button class="view-btn" data-id="${task._id}" title="View Task">
          <i class="fas fa-eye"></i>
        </button>
        <button class="edit-btn" data-id="${task._id}" title="Edit Task">
          <i class="fas fa-edit"></i>
        </button>
        <button class="delete-btn" data-id="${task._id}" title="Delete Task">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;

    // Add all event listeners
    const checkbox = taskElement.querySelector(".task-checkbox");
    const viewBtn = taskElement.querySelector(".view-btn");
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

    // View button event
    viewBtn.addEventListener("click", () => showTaskViewModal(task));

    // Edit button event
    editBtn.addEventListener("click", () => editTask(task._id));

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

  // Edit task
  const editTask = async (taskId) => {
    try {
      // First fetch the current task data
      const response = await fetch(`/api/tasks/${taskId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch task");
      }
      const task = await response.json();

      // Populate the modal with current task data
      taskTitle.value = task.title;
      taskDescription.value = task.description || "";
      taskCategory.value = task.category ? task.category._id : "";
      taskDueDate.value = task.dueDate ? task.dueDate.split("T")[0] : "";
      taskPriority.value = task.priority || "medium";

      // Change modal title and button text for editing
      document.querySelector(
        "#task-modal-overlay .modal-header h3"
      ).textContent = "Edit Task";
      taskModalSave.textContent = "Update Task";

      // Store the task ID for updating
      taskModalSave.dataset.editingId = taskId;

      // Show the modal
      taskModalOverlay.classList.add("active");
      taskTitle.focus();
    } catch (error) {
      console.error("Error loading task for editing:", error);
      alert("Failed to load task for editing");
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    const confirmed = await customConfirm(
      "Are you sure you want to delete this task?",
      "Delete Task"
    );
    if (!confirmed) return;

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
  loadCategories();
  loadTasks();
});
