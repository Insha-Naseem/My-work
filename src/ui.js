// UI State Management
let currentData = {
    todos: [],
    windowSize: {width: 320, height: 400},
    isExpanded: true
};

// Priority configuration
const PRIORITY_CONFIG = {
    'next-phase': {color: '#ff6b6b', label: 'Next Phase'},
    'developer-urgent': {color: '#ff4757', label: 'Developer Urgent'},
    '1-2-days': {color: '#ffa502', label: '1-2 Days'},
    'normal': {color: '#70a1ff', label: 'Normal'}
};

// Initialize the UI
function init() {
    console.log('[js] Initializing UIX');
    parent.postMessage({pluginMessage: 'anything here'}, '*')
    setupEventListeners();
    updateUI();
    parent.postMessage({pluginMessage: {type: 'get-data'}}, '*');
}

// Set up event listeners
function setupEventListeners() {
    console.log('[js] Setting up event listeners');
    document.getElementById('header').addEventListener('click', toggleForm);
    document.getElementById('addBtn').addEventListener('click', addTodo);
    document.getElementById('clearBtn').addEventListener('click', clearForm);
    document.getElementById('linkTypeSelect').addEventListener('change', updateLinkInput);

    document.getElementById('descriptionInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) addTodo();
    });

    window.addEventListener('message', handlePluginMessage);
}

// Handle messages from the plugin
function handlePluginMessage(event) {
    const message = event.data.pluginMessage;
    if (message && message.type === 'data-update') {
        currentData = message.data;

        updateUI();
        clearForm();
    }
}

// Toggle form visibility
function toggleForm() {
    currentData.isExpanded = !currentData.isExpanded;
    updateFormVisibility();
    parent.postMessage({pluginMessage: {type: 'toggle-expanded'}}, '*');
}

// Update form visibility
function updateFormVisibility() {
    const formSection = document.getElementById('formSection');
    const toggleBtn = document.getElementById('toggleBtn');

    if (currentData.isExpanded) {
        formSection.classList.remove('collapsed');
        toggleBtn.textContent = '−';
    } else {
        formSection.classList.add('collapsed');
        toggleBtn.textContent = '+';
    }
}

// Update link input based on type
function updateLinkInput() {
    const linkType = document.getElementById('linkTypeSelect').value;
    const label = document.getElementById('linkLabel');
    const input = document.getElementById('linkInput');

    if (linkType === 'comment') {
        label.textContent = 'Comment Link';
        input.placeholder = 'Paste Figma comment URL';
    } else {
        label.textContent = 'Custom Note';
        input.placeholder = 'Enter custom note';
    }
}

// Add new todo
function addTodo() {
    const description = document.getElementById('descriptionInput').value.trim();
    if (!description) {
        alert('Please enter a description');
        return;
    }

    const priority = document.getElementById('prioritySelect').value;
    const linkType = document.getElementById('linkTypeSelect').value;
    const linkValue = document.getElementById('linkInput').value.trim();
    const attachment = document.getElementById('attachmentInput').value.trim();

    const todoData = {description, priority, completed: false};

    if (linkValue) {
        if (linkType === 'comment') {
            todoData.commentLink = linkValue;
        } else {
            todoData.customNote = linkValue;
        }
    }

    if (attachment) {
        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(attachment);
        todoData.attachment = {
            type: isImage ? 'image' : 'link',
            url: attachment,
            title: attachment.split('/').pop() || 'Attachment'
        };
    }

    parent.postMessage({pluginMessage: {type: 'add-todo', todo: todoData}}, '*');
}

// Clear form
function clearForm() {
    console.log('[js] Clearing form');
    document.getElementById('descriptionInput').value = '';
    document.getElementById('prioritySelect').value = 'normal';
    document.getElementById('linkTypeSelect').value = 'comment';
    document.getElementById('linkInput').value = '';
    document.getElementById('attachmentInput').value = '';
    updateLinkInput();
    document.getElementById('descriptionInput').focus();
}

// Update UI
function updateUI() {
    updateFormVisibility();
    updateTodoCount();
    renderTodos();
}

// Update todo count
function updateTodoCount() {
    const total = currentData.todos.length;
    const completed = currentData.todos.filter(todo => todo.completed).length;
    const remaining = total - completed;
    document.getElementById('todoCount').textContent = remaining;
}

// Render todos
function renderTodos() {
    const todosSection = document.getElementById('todosSection');
    const emptyState = document.getElementById('emptyState');

    if (currentData.todos.length === 0) {
        emptyState.style.display = 'block';
        todosSection.innerHTML = emptyState.outerHTML;
        return;
    }

    emptyState.style.display = 'none';
    const todosHTML = currentData.todos.map(todo => createTodoHTML(todo)).join('');
    todosSection.innerHTML = todosHTML;
    attachTodoEventListeners();
}

// Create HTML for a todo item
function createTodoHTML(todo) {
    const priorityConfig = PRIORITY_CONFIG[todo.priority];
    const completedClass = todo.completed ? 'completed' : '';
    const timestamp = formatTimestamp(todo.createdAt);

    let linkHTML = '';
    if (todo.commentLink) {
        linkHTML = `<a class="todo-link" href="#" data-url="${todo.commentLink}">🔗 Comment Link</a>`;
    } else if (todo.customNote) {
        linkHTML = `<span class="todo-note">📝 ${escapeHtml(todo.customNote)}</span>`;
    }

    let attachmentHTML = '';
    if (todo.attachment) {
        const icon = todo.attachment.type === 'image' ? '🖼️' : '🔗';
        attachmentHTML = `
            <div class="todo-attachment">
                <span class="todo-attachment-icon">${icon}</span>
                <a href="#" class="todo-link" data-url="${todo.attachment.url}">${todo.attachment.title}</a>
            </div>
        `;
    }

    return `
        <div class="todo-item ${completedClass}" data-id="${todo.id}">
            <div class="todo-header">
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <div class="todo-content">
                    <div class="todo-description">${escapeHtml(todo.description)}</div>
                    <div class="todo-meta">
                        <span class="priority-badge priority-${todo.priority}">${priorityConfig.label}</span>
                        ${linkHTML}
                    </div>
                    ${attachmentHTML}
                    <div class="timestamp">${timestamp}</div>
                </div>
            </div>
            <button class="todo-delete" data-id="${todo.id}">×</button>
        </div>
    `;
}

// Attach event listeners to todo items
function attachTodoEventListeners() {
    // Checkbox toggles
    document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const todoId = e.target.closest('.todo-item').dataset.id;
            parent.postMessage({pluginMessage: {type: 'toggle-complete', id: todoId}}, '*');
        });
    });

    // Delete buttons
    document.querySelectorAll('.todo-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const todoId = btn.dataset.id;
            if (confirm('Are you sure you want to delete this todo?')) {
                parent.postMessage({pluginMessage: {type: 'delete-todo', id: todoId}}, '*');
            }
        });
    });

    // Link clicks
    document.querySelectorAll('.todo-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const url = link.dataset.url;
            if (url) {
                if (url.includes('figma.com')) {
                    copyToClipboard(url);
                    console.log('Comment link copied to clipboard');
                } else {
                    window.open(url, '_blank');
                }
            }
        });
    });
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
}

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
    } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
