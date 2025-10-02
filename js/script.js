const todoForm = document.getElementById('todoForm');
const todoInput = document.getElementById('todoInput');
const dateInput = document.getElementById('dateInput');
const todoError = document.getElementById('todoError');
const dateError = document.getElementById('dateError');
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');
const filterButtons = document.querySelectorAll('.filter-btn');
const taskCount = document.getElementById('taskCount');

let todos = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
    loadTodos();
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

function addTodo(text, date) {
    const todo = {
        id: Date.now(),
        text: text,
        date: date,
        completed: false
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

function getFilteredTodos() {
    switch (currentFilter) {
        case 'active':
            return todos.filter(todo => !todo.completed);
        case 'completed':
            return todos.filter(todo => todo.completed);
        default:
            return todos;
    }
}

function updateTaskCount() {
    const filteredTodos = getFilteredTodos();
    const count = filteredTodos.length;
    taskCount.textContent = `${count} ${count === 1 ? 'task' : 'tasks'}`;
}

function renderTodos() {
    const filteredTodos = getFilteredTodos();
    
    todoList.innerHTML = '';
    
    if (filteredTodos.length === 0) {
        emptyState.classList.remove('hidden');
        todoList.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden');
        todoList.classList.remove('hidden');
        
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            
            li.innerHTML = `
                <input 
                    type="checkbox" 
                    class="todo-checkbox" 
                    ${todo.completed ? 'checked' : ''}
                    data-id="${todo.id}"
                >
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
                deleteTodo(id);
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
        
        addTodo(todoText, todoDate);
        
        todoInput.value = '';
        dateInput.value = '';
        
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