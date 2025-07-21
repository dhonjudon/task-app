const taskInput = document.getElementById("task");
const addTaskButton = document.getElementById("add-task");
const taskDisplay = document.querySelector(".task-display");

addTaskButton.addEventListener("click", () => {
  const taskText = taskInput.value.trim();

  if (taskText !== "") {
    const taskItem = document.createElement("div");
    taskItem.className = "task-item";

    // Create text node
    const textSpan = document.createElement("span");
    textSpan.textContent = taskText;

    // Create delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️"; // trash can icon
    deleteBtn.className = "delete-btn";

    // Delete functionality
    deleteBtn.addEventListener("click", () => {
      taskDisplay.removeChild(taskItem);
    });

    taskItem.appendChild(textSpan);
    taskItem.appendChild(deleteBtn);
    taskDisplay.appendChild(taskItem);

    taskInput.value = "";
  }
});
