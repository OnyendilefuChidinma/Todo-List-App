// Select all necessary DOM elements
const taskInput = document.getElementById('taskInput');
const dueDateInput = document.getElementById('dueDateInput');
const prioritySelect = document.getElementById('prioritySelect');
const addTaskButton = document.getElementById('addTaskButton');
const taskList = document.getElementById('taskList');
const clearCompletedButton = document.getElementById('clearCompletedButton');
const clearAllButton = document.getElementById('clearAllButton');
const alert = document.querySelector('.alert');

// Initialize tasks array from local storage or empty array
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let editIndex = null;  // Track index for editing tasks

function setDateInputMin() {
    const dateInput = document.getElementById("dueDateInput");
    const today = new Date().toISOString().split("T")[0];
    dateInput.min = today;
}
setDateInputMin();


// Save tasks array to local storage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Render tasks based on filter type
function renderTasks(filter = 'all') {
    taskList.innerHTML = ''; // Clear task list display

    // Sort tasks by due date, from closest to latest
    tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    // Loop through tasks and display based on selected filter
    tasks.forEach((task, index) => {
        if (filter === 'all' && !task.deleted ||
            (filter === 'completed' && task.completed) ||
            (filter === 'pending' && !task.completed && !task.deleted) ||
            (filter === 'deleted' && task.deleted) ||
            (filter === 'high' && task.priority === 'high' && !task.deleted ) ||
            (filter === 'medium' && task.priority === 'medium' && !task.deleted ) ||
            (filter === 'low' && task.priority === 'low' && !task.deleted )) {

            // Create task item elements
            const taskItem = document.createElement('li');
            taskItem.classList.add(task.priority);  // Apply priority class for styling

            
            const taskText = document.createElement('span');
            taskText.classList.add('task-text');
            taskText.textContent = task.text;
            
            const dueDate = document.createElement('span');
            dueDate.classList.add('due-date');
            dueDate.textContent = task.dueDate;

            // Create Complete/Undo button
            const completeButton = document.createElement('button');
            completeButton.textContent = task.completed ? 'Undo' : 'Complete';
            completeButton.classList.add('complete');
            if (completeButton.textContent === "Undo") {
                completeButton.classList.add('undo');
            }
            // completeButton.classList.add('complete');
            completeButton.onclick = () => toggleComplete(index);

            // Create Edit button
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.classList.add('edit');
            editButton.onclick = () => editTask(index);
            
            // Create Delete button
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('delete');
            deleteButton.onclick = () => deleteTask(index);
            
            // Dividing the list item (li) into two groups (Text-Section and Button-Section)
            const taskItem_btn_section = document.createElement('span');
            taskItem_btn_section.classList.add('taskItem_btn_sect')

            const taskItem_text_section = document.createElement('span');
            taskItem_text_section.classList.add('taskItem_text_sect')


            
            // Append elements to task item and task list

            taskItem.appendChild(taskItem_text_section);
            taskItem_text_section.appendChild(taskText);
            taskItem_text_section.appendChild(dueDate);

            taskItem.appendChild(taskItem_btn_section);
            taskItem_btn_section.appendChild(completeButton);
            taskItem_btn_section.appendChild(editButton);
            taskItem_btn_section.appendChild(deleteButton);
                        
            taskList.appendChild(taskItem);
            
            
            // taskItem.appendChild(taskText);
            // taskItem.appendChild(dueDate);
            // taskItem.appendChild(completeButton);
            // taskItem.appendChild(editButton);
            // taskItem.appendChild(deleteButton);
            // taskList.appendChild(taskItem);
        }

    });
}

function filterTasks(filter) {
    // Render tasks based on selected filter
    renderTasks(filter);

    // Get all filter buttons
    const filterButtons = document.querySelectorAll('.filter-buttons button');

    // Remove 'active' class from all buttons
    filterButtons.forEach(button => button.classList.remove('active'));

    // Find the clicked button based on the filter and add 'active' class
    const activeButton = Array.from(filterButtons).find(button => button.getAttribute('data-filter') === filter);
    if (activeButton) activeButton.classList.add('active');
}

// Function to display alert
function displayAlert(text,action){
    alert.textContent = text;
    alert.classList.add(`alert-${action}`);

    // remove Alert
    setTimeout(function(){
        alert.textContent = "";
        alert.classList.remove(`alert-${action}`);

    }, 2000);
}

// Add or save task
addTaskButton.addEventListener('click', () => {
    const text = taskInput.value.trim();
    const priority = prioritySelect.value;
    const dueDate = dueDateInput.value;

    if (text && dueDate) {
        // Check if editing or adding new task
        if (editIndex !== null) {
            // Update existing task
            tasks[editIndex] = { ...tasks[editIndex], text, priority, dueDate };
            editIndex = null;  // Reset edit index
            addTaskButton.textContent = 'Add Task';  // Reset button text
            displayAlert('Task updated successfully.', 'success');
        } else {
            // Add new task
            tasks.push({ text, completed: false, priority, dueDate, deleted: false });
            displayAlert('Task added successfully.', 'success');
        }
        saveTasks();
        renderTasks();  // Refresh task display
        taskInput.value = '';  // Clear input fields
        dueDateInput.value = '';
    } else {
    displayAlert("Please fill in all fields.", "danger");
  }
});

// Toggle task completion status
// Toggle the 'completed' status of the task at the given index
function toggleComplete(index) {
    tasks[index].completed = !tasks[index].completed;
     // Display a different alert based on the new status of the task
     if (tasks[index].completed) {
        displayAlert('You have marked this task as completed.', 'success');
    } else {
        displayAlert('You have unmarked this task as uncompleted.', 'danger');
    }
    // Save the tasks array to local storage and re-render the tasks list
    saveTasks();
    renderTasks();
}

// Edit task by setting values in input fields and changing button text
function editTask(index) {
    const task = tasks[index];
    taskInput.value = task.text;
    dueDateInput.value = task.dueDate;
    prioritySelect.value = task.priority;
    editIndex = index;  // Set edit index to current task
    addTaskButton.textContent = 'Save';  // Change button text to Save
}

// Mark task as deleted without removing from list
function deleteTask(index) {
    tasks[index].deleted = true;
    displayAlert('You have deleted this task.', 'danger');
    saveTasks();
    renderTasks();
}

// Clear all completed tasks and mark as deleted
clearCompletedButton.addEventListener('click', () => {
    tasks.forEach(task => {
        // if (task.completed) task.deleted = true;
        if (task.completed) {
            task.deleted = true;
            displayAlert('You have deleted your completed tasks.', 'danger');
        }
    });
    saveTasks();
    renderTasks();
});

// Clear all tasks
clearAllButton.addEventListener('click', () => {
    tasks = [];  // Reset task list
    displayAlert('You have deleted all tasks.', 'danger')
    saveTasks();
    renderTasks();
});

// Initial render of tasks on page load
renderTasks();
