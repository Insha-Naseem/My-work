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

let currentFilter = 'all';

// Initialize the UI
function init() {
    console.log('[js] Initializing UIX');
    parent.postMessage({pluginMessage: 'anything here'}, '*')
    setupEventListeners();
    setupFilterBar();
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
    else if (message && message.type === 'open-link') { 
        const url = message.url;
        if (url) {
            window.open(url, '_blank');
        }
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

// Set up filter bar
function setupFilterBar() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.priority;
            renderTodos();
        });
    });
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
    console.log('[js] Rendering todos:', currentData.todos);

    let filteredTodos = currentData.todos;
    if (currentFilter !== 'all') {
        filteredTodos = currentData.todos.filter(todo => todo.priority === currentFilter);
    }

    if (filteredTodos.length === 0) {
        todosSection.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <div class="empty-state-text">No todos yet<br>Add your first todo above!</div>
            </div>
        `;
        return;
    }

    const todosHTML = filteredTodos.map(todo => createTodoHTML(todo)).join('');
    todosSection.innerHTML = todosHTML;
    attachTodoEventListeners();
}

// Create HTML for a todo item
let editingTodoId = null;
let editingTodoOriginal = null;

function createTodoHTML(todo) {
    const priorityConfig = PRIORITY_CONFIG[todo.priority];
    const completedClass = todo.completed ? 'completed' : '';
    const timestamp = formatTimestamp(todo.createdAt);

    if (editingTodoId === todo.id) {
        // Render improved edit form for this todo
        return `
        <div class="todo-item editing ${completedClass}" data-id="${todo.id}" style="padding: 16px 16px 12px 16px;">
            <form class="edit-todo-form" autocomplete="off" onsubmit="return false;">
                <div class="form-group" style="margin-bottom: 12px;">
                    <label class="form-label">Description</label>
                    <input class="form-input edit-description" value="${escapeHtml(todo.description)}" placeholder="Description" style="margin-bottom: 0;">
                </div>
                <div class="form-row" style="gap: 8px; margin-bottom: 12px;">
                    <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label">Priority</label>
                        <select class="form-input edit-priority">
                            <option value="normal" ${todo.priority === 'normal' ? 'selected' : ''}>Normal</option>
                            <option value="1-2-days" ${todo.priority === '1-2-days' ? 'selected' : ''}>1-2 Days</option>
                            <option value="developer-urgent" ${todo.priority === 'developer-urgent' ? 'selected' : ''}>Developer Urgent</option>
                            <option value="next-phase" ${todo.priority === 'next-phase' ? 'selected' : ''}>Next Phase</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label">Type</label>
                        <select class="form-input edit-link-type">
                            <option value="comment" ${todo.commentLink ? 'selected' : ''}>Comment Link</option>
                            <option value="custom" ${todo.customNote ? 'selected' : ''}>Custom Note</option>
                        </select>
                    </div>
                </div>
                <div class="form-group" style="margin-bottom: 12px;">
                    <label class="form-label">${todo.commentLink ? 'Comment Link' : 'Custom Note'}</label>
                    <input class="form-input edit-link" value="${escapeHtml(todo.commentLink || todo.customNote || '')}" placeholder="Paste Figma comment URL or custom note">
                </div>
                <div class="form-group" style="margin-bottom: 12px;">
                    <label class="form-label">Attachment (Optional)</label>
                    <input class="form-input edit-attachment" value="${todo.attachment ? escapeHtml(todo.attachment.url) : ''}" placeholder="Image URL or web link">
                </div>
                <div style="display: flex; gap: 8px; margin-top: 8px;">
                    <button class="todo-save" data-id="${todo.id}">Save</button>
                    <button class="todo-cancel" data-id="${todo.id}">Cancel</button>
                </div>
                <div class="timestamp" style="margin-top: 8px;">${timestamp}</div>
            </form>
        </div>
        `;
    }

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
                <div class="todo-actions">
                    <button class="todo-delete" data-id="${todo.id}">×</button>
                    <button class="todo-edit" data-id="${todo.id}" title="Edit" aria-label="Edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#667eea" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Attach event listeners to todo items
function attachTodoEventListeners() {
    // Checkbox toggles
    document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
        if (checkbox.disabled) return;
        checkbox.addEventListener('change', (e) => {
            const todoId = e.target.closest('.todo-item').dataset.id;
            parent.postMessage({pluginMessage: {type: 'toggle-complete', id: todoId}}, '*');
        });
    });

    // Edit buttons
    document.querySelectorAll('.todo-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const todoId = btn.dataset.id;
            editingTodoId = todoId;
            // Save original for cancel
            editingTodoOriginal = currentData.todos.find(t => t.id === todoId);
            renderTodos();
        });
    });

    // Save buttons
    document.querySelectorAll('.todo-save').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const todoId = btn.dataset.id;
            const itemElem = document.querySelector(`.todo-item[data-id='${todoId}']`);
            const description = itemElem.querySelector('.edit-description').value.trim();
            const priority = itemElem.querySelector('.edit-priority').value;
            const linkType = itemElem.querySelector('.edit-link-type').value;
            const linkValue = itemElem.querySelector('.edit-link').value.trim();
            const attachment = itemElem.querySelector('.edit-attachment').value.trim();

            const updates = { description, priority };
            if (linkType === 'comment') {
                updates.commentLink = linkValue || undefined;
                updates.customNote = undefined;
            } else {
                updates.customNote = linkValue || undefined;
                updates.commentLink = undefined;
            }
            if (attachment) {
                const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(attachment);
                updates.attachment = {
                    type: isImage ? 'image' : 'link',
                    url: attachment,
                    title: attachment.split('/').pop() || 'Attachment'
                };
            } else {
                updates.attachment = undefined;
            }

            parent.postMessage({pluginMessage: {type: 'update-todo', id: todoId, updates}}, '*');
            editingTodoId = null;
            editingTodoOriginal = null;
        });
    });

    // Cancel buttons
    document.querySelectorAll('.todo-cancel').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            editingTodoId = null;
            editingTodoOriginal = null;
            renderTodos();
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
                // Send message to plugin to open the link
                parent.postMessage({pluginMessage: {type: 'open-link', url}}, '*');
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
