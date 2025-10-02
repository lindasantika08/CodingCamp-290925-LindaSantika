const todoForm = document.getElementById('todoForm');
const todoInput = document.getElementById('todoInput');
const dateInput = document.getElementById('dateInput');
const priorityInput = document.getElementById('priorityInput');
const todoError = document.getElementById('todoError');
const dateError = document.getElementById('dateError');
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');
const filterButtons = document.querySelectorAll('.filter-btn');
const priorityFilterButtons = document.querySelectorAll('.priority-filter-btn');
const sortButtons = document.querySelectorAll('.sort-btn');
const themeButtons = document.querySelectorAll('.theme-btn');
const taskCount = document.getElementById('taskCount');

let todos = [];
let currentFilter = 'all';
let currentPriorityFilter = 'all';
let currentSort = 'date-asc';
let currentTheme = 'purple';

document.addEventListener('DOMContentLoaded', () => {
    loadTodos();
    loadTheme();
    setMinDate();
    renderTodos();
});

function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
}

function loadTodos() {
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
        todos = JSON.parse(storedTodos);
    }
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function loadTheme() {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
        currentTheme = storedTheme;
        applyTheme(currentTheme);
    }
    updateActiveThemeButton();
}

function applyTheme(theme) {
    document.body.className = `theme-${theme}`;
    currentTheme = theme;
    localStorage.setItem('theme', theme);
}

function updateActiveThemeButton() {
    themeButtons.forEach(btn => {
        if (btn.dataset.theme === currentTheme) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function validateForm() {
    let isValid = true;
    
    todoError.textContent = '';
    dateError.textContent = '';
    
    const todoValue = todoInput.value.trim();
    if (todoValue === '') {
        todoError.textContent = 'Please enter a task description';
        isValid = false;
    } else if (todoValue.length < 3) {
        todoError.textContent = 'Task description must be at least 3 characters';
        isValid = false;
    }
    
    if (dateInput.value === '') {
        dateError.textContent = 'Please select a due date';
        isValid = false;
    } else {
        const selectedDate = new Date(dateInput.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            dateError.textContent = 'Due date cannot be in the past';
            isValid = false;
        }
    }
    
    return isValid;
}

function addTodo(text, date, priority) {
    const todo = {
        id: Date.now(),
        text: text,
        date: date,
        priority: priority,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    todos.push(todo);
    saveTodos();
    renderTodos();
}

function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
}

function toggleTodo(id) {
    const todo = todos.find(todo => todo.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function filterByStatus(todosList) {
    switch (currentFilter) {
        case 'active':
            return todosList.filter(todo => !todo.completed);
        case 'completed':
            return todosList.filter(todo => todo.completed);
        default:
            return todosList;
    }
}

function filterByPriority(todosList) {
    if (currentPriorityFilter === 'all') {
        return todosList;
    }
    return todosList.filter(todo => (todo.priority || 'medium') === currentPriorityFilter);
}

function sortTodos(todosList) {
    const sorted = [...todosList];
    
    switch (currentSort) {
        case 'date-asc':
            return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
        case 'date-desc':
            return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
        case 'priority':
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return sorted.sort((a, b) => {
                const aPriority = a.priority || 'medium';
                const bPriority = b.priority || 'medium';
                return priorityOrder[aPriority] - priorityOrder[bPriority];
            });
        case 'name':
            return sorted.sort((a, b) => a.text.toLowerCase().localeCompare(b.text.toLowerCase()));
        default:
            return sorted;
    }
}

function getProcessedTodos() {
    let processed = [...todos];
    processed = filterByStatus(processed);
    processed = filterByPriority(processed);
    processed = sortTodos(processed);
    return processed;
}

function updateTaskCount() {
    const processedTodos = getProcessedTodos();
    const count = processedTodos.length;
    const totalActive = todos.filter(t => !t.completed).length;
    const totalCompleted = todos.filter(t => t.completed).length;
    
    taskCount.innerHTML = `
        <strong>${count}</strong> ${count === 1 ? 'task' : 'tasks'} shown | 
        <span style="color: #3498db;">${totalActive} active</span> | 
        <span style="color: #27ae60;">${totalCompleted} completed</span>
    `;
}

function getPriorityEmoji(priority) {
    switch (priority) {
        case 'high': return '🔴';
        case 'medium': return '🟡';
        case 'low': return '🟢';
        default: return '';
    }
}

function renderTodos() {
    const processedTodos = getProcessedTodos();
    
    todoList.innerHTML = '';
    
    if (processedTodos.length === 0) {
        emptyState.classList.remove('hidden');
        todoList.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden');
        todoList.classList.remove('hidden');
        
        processedTodos.forEach(todo => {
            if (!todo.priority) {
                todo.priority = 'medium';
            }
            
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            
            li.innerHTML = `
                <input 
                    type="checkbox" 
                    class="todo-checkbox" 
                    ${todo.completed ? 'checked' : ''}
                    data-id="${todo.id}"
                >
                <span class="priority-badge ${todo.priority}">
                    ${getPriorityEmoji(todo.priority)} ${todo.priority.toUpperCase()}
                </span>
                <div class="todo-content">
                    <div class="todo-text">${escapeHtml(todo.text)}</div>
                    <div class="todo-date">
                        <span class="date-icon">📅</span>
                        <span>${formatDate(todo.date)}</span>
                    </div>
                </div>
                <button class="btn-delete" data-id="${todo.id}">
                     Delete
                </button>
            `;
            
            todoList.appendChild(li);
        });
        
        document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const id = parseInt(e.target.dataset.id);
                toggleTodo(id);
            });
        });
        
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                if (confirm('Are you sure you want to delete this task?')) {
                    deleteTodo(id);
                }
            });
        });
    }
    
    updateTaskCount();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (validateForm()) {
        const todoText = todoInput.value.trim();
        const todoDate = dateInput.value;
        const todoPriority = priorityInput.value;
        
        addTodo(todoText, todoDate, todoPriority);
        
        todoInput.value = '';
        dateInput.value = '';
        priorityInput.value = 'medium';
        
        todoError.textContent = '';
        dateError.textContent = '';
    }
});

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentFilter = button.dataset.filter;
        renderTodos();
    });
});

priorityFilterButtons.forEach(button => {
    button.addEventListener('click', () => {
        priorityFilterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentPriorityFilter = button.dataset.priority;
        renderTodos();
    });
});

sortButtons.forEach(button => {
    button.addEventListener('click', () => {
        sortButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentSort = button.dataset.sort;
        renderTodos();
    });
});

themeButtons.forEach(button => {
    button.addEventListener('click', () => {
        applyTheme(button.dataset.theme);
        updateActiveThemeButton();
    });
});