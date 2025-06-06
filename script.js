document.addEventListener('DOMContentLoaded', function() {
    // Initialize the app
    showTasks();
    updateTaskCount();
    updateStats();
    checkEmptyState();
    
    // Add event listeners for filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterTasks(this.dataset.filter);
        });
    });
    
    // Add event listener for Enter key in input box
    document.getElementById('input-box').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
});

function addTask() {
    const inputBox = document.getElementById("input-box");
    const listContainer = document.getElementById("list-container");
    const prioritySelect = document.getElementById("task-priority");
    
    if (inputBox.value.trim() === '') {
        // Show error animation
        inputBox.classList.add('shake');
        setTimeout(() => inputBox.classList.remove('shake'), 500);
        return;
    }
    
    // Create task element
    const taskId = Date.now();
    const taskElement = document.createElement("li");
    taskElement.dataset.id = taskId;
    taskElement.dataset.priority = prioritySelect.value;
    
    taskElement.innerHTML = `
        <div class="task-content">
            <div class="task-priority priority-${prioritySelect.value}"></div>
            <div>
                <div class="task-text">${inputBox.value.trim()}</div>
                <div class="task-date">${formatDate(new Date())}</div>
            </div>
        </div>
        <div class="task-actions">
            <button class="complete-btn"><i class="fas fa-check"></i></button>
            <button class="delete-btn"><i class="fas fa-trash"></i></button>
        </div>
    `;
    
    listContainer.appendChild(taskElement);
    inputBox.value = "";
    
    // Add event listeners to the new task buttons
    taskElement.querySelector('.complete-btn').addEventListener('click', function() {
        taskElement.classList.toggle('checked');
        updateTaskCount();
        saveTasks();
        updateStats();
        checkEmptyState();
    });
    
    taskElement.querySelector('.delete-btn').addEventListener('click', function() {
        taskElement.classList.add('fade-out');
        setTimeout(() => {
            taskElement.remove();
            updateTaskCount();
            saveTasks();
            updateStats();
            checkEmptyState();
        }, 300);
    });
    
    // Scroll to the new task
    taskElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    updateTaskCount();
    saveTasks();
    updateStats();
    checkEmptyState();
}

function filterTasks(filter) {
    const tasks = document.querySelectorAll('#list-container li');
    
    tasks.forEach(task => {
        if (filter === 'all' || task.dataset.priority === filter) {
            task.style.display = 'flex';
        } else {
            task.style.display = 'none';
        }
    });
}

function updateTaskCount() {
    const totalTasks = document.querySelectorAll('#list-container li').length;
    const completedTasks = document.querySelectorAll('#list-container li.checked').length;
    
    document.getElementById('task-count').textContent = `${totalTasks} ${totalTasks === 1 ? 'task' : 'tasks'}`;
    document.getElementById('completed-count').textContent = `${completedTasks} completed`;
    document.getElementById('remaining-count').textContent = `${totalTasks - completedTasks} remaining`;
    
    // Update progress bar
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    document.getElementById('progress-fill').style.width = `${progress}%`;
}

function clearCompleted() {
    const completedTasks = document.querySelectorAll('#list-container li.checked');
    
    if (completedTasks.length === 0) {
        // Show shake animation to indicate nothing to clear
        const button = document.querySelector('.app-footer button');
        button.classList.add('shake');
        setTimeout(() => button.classList.remove('shake'), 500);
        return;
    }
    
    completedTasks.forEach(task => {
        task.classList.add('fade-out');
        setTimeout(() => task.remove(), 300);
    });
    
    setTimeout(() => {
        updateTaskCount();
        saveTasks();
        updateStats();
        checkEmptyState();
    }, 350);
}

function saveTasks() {
    const tasks = [];
    document.querySelectorAll('#list-container li').forEach(task => {
        tasks.push({
            id: task.dataset.id,
            text: task.querySelector('.task-text').textContent,
            priority: task.dataset.priority,
            date: task.querySelector('.task-date').textContent,
            completed: task.classList.contains('checked')
        });
    });
    
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function showTasks() {
    const savedTasks = localStorage.getItem('tasks');
    if (!savedTasks) {
        checkEmptyState();
        return;
    }
    
    const tasks = JSON.parse(savedTasks);
    const listContainer = document.getElementById('list-container');
    
    tasks.forEach(task => {
        const taskElement = document.createElement('li');
        taskElement.dataset.id = task.id;
        taskElement.dataset.priority = task.priority;
        if (task.completed) taskElement.classList.add('checked');
        
        taskElement.innerHTML = `
            <div class="task-content">
                <div class="task-priority priority-${task.priority}"></div>
                <div>
                    <div class="task-text">${task.text}</div>
                    <div class="task-date">${task.date}</div>
                </div>
            </div>
            <div class="task-actions">
                <button class="complete-btn"><i class="fas fa-check"></i></button>
                <button class="delete-btn"><i class="fas fa-trash"></i></button>
            </div>
        `;
        
        listContainer.appendChild(taskElement);
        
        // Add event listeners
        taskElement.querySelector('.complete-btn').addEventListener('click', function() {
            taskElement.classList.toggle('checked');
            updateTaskCount();
            saveTasks();
            updateStats();
            checkEmptyState();
        });
        
        taskElement.querySelector('.delete-btn').addEventListener('click', function() {
            taskElement.classList.add('fade-out');
            setTimeout(() => {
                taskElement.remove();
                updateTaskCount();
                saveTasks();
                updateStats();
                checkEmptyState();
            }, 300);
        });
    });
    
    checkEmptyState();
}

function formatDate(date) {
    const options = { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
    };
    return date.toLocaleString('en-US', options);
}

function updateStats() {
    const totalTasks = document.querySelectorAll('#list-container li').length;
    const completedTasks = document.querySelectorAll('#list-container li.checked').length;
    
    document.getElementById('total-tasks').textContent = totalTasks;
    document.getElementById('completed-tasks').textContent = completedTasks;
    document.getElementById('pending-tasks').textContent = totalTasks - completedTasks;
}

function checkEmptyState() {
    const emptyState = document.getElementById('empty-state');
    const hasTasks = document.querySelectorAll('#list-container li').length > 0;
    emptyState.style.display = hasTasks ? 'none' : 'block';
}


// Add fade-out animation to CSS when needed
const style = document.createElement('style');
style.textContent = `
    .fade-out {
        opacity: 0;
        transform: translateX(20px);
        transition: all 0.3s ease;
    }
    .shake {
        animation: shake 0.5s ease;
    }
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20%, 60% { transform: translateX(-5px); }
        40%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);