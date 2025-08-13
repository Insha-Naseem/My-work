// Types for the todo list plugin
// Priority configuration
const PRIORITY_CONFIG = {
    'next-phase': { color: '#ff6b6b', label: 'Next Phase' },
    'developer-urgent': { color: '#ff4757', label: 'Developer Urgent' },
    '1-2-days': { color: '#ffa502', label: '1-2 Days' },
    'normal': { color: '#70a1ff', label: 'Normal' }
};

// Default plugin data
const DEFAULT_DATA = {
    todos: [],
    windowSize: { width: 320, height: 400 },
    isExpanded: false
};

// Main plugin class
class TodoListPlugin {
    constructor() {
        this.data = DEFAULT_DATA;
        this.init();
    }

    async init() {
        try {
            // Load saved data
            await this.loadData();
            
            // Set up the UI
            figma.showUI(__html__, {
                width: this.data.windowSize.width,
                height: this.data.windowSize.height,
                themeColors: true
            });

            // Send initial data to UI
            this.sendDataToUI();

            // Set up message handlers
            figma.ui.onmessage = this.handleMessage.bind(this);
            
        } catch (error) {
            console.error('Plugin initialization failed:', error);
            figma.notify('Failed to initialize plugin', { error: true });
        }
    }

    async loadData() {
        try {
            const savedData = await figma.clientStorage.getAsync('todoData');
            if (savedData) {
                this.data = { ...DEFAULT_DATA, ...savedData };
            }
        } catch (error) {
            console.error('Failed to load data:', error);
            // Continue with default data
        }
    }

    async saveData() {
        try {
            await figma.clientStorage.setAsync('todoData', this.data);
        } catch (error) {
            console.error('Failed to save data:', error);
            figma.notify('Failed to save data', { error: true });
        }
    }

    sendDataToUI() {
        figma.ui.postMessage({
            type: 'data-update',
            data: this.data
        });
    }

    handleMessage(message) {
        switch (message.type) {
            case 'add-todo':
                this.addTodo(message.todo);
                break;
            case 'update-todo':
                this.updateTodo(message.id, message.updates);
                break;
            case 'delete-todo':
                this.deleteTodo(message.id);
                break;
            case 'toggle-complete':
                this.toggleTodoComplete(message.id);
                break;
            case 'resize-window':
                this.resizeWindow(message.width, message.height);
                break;
            case 'toggle-expanded':
                this.toggleExpanded();
                break;
            case 'get-data':
                this.sendDataToUI();
                break;
            default:
                console.warn('Unknown message type:', message.type);
        }
    }

    async addTodo(todoData) {
        const newTodo = {
            ...todoData,
            id: this.generateId(),
            createdAt: Date.now()
        };

        this.data.todos.unshift(newTodo); // Add to beginning of array
        await this.saveData();
        this.sendDataToUI();
        
        figma.notify('Todo added successfully');
    }

    async updateTodo(id, updates) {
        const todoIndex = this.data.todos.findIndex(todo => todo.id === id);
        if (todoIndex !== -1) {
            this.data.todos[todoIndex] = { ...this.data.todos[todoIndex], ...updates };
            await this.saveData();
            this.sendDataToUI();
        }
    }

    async deleteTodo(id) {
        this.data.todos = this.data.todos.filter(todo => todo.id !== id);
        await this.saveData();
        this.sendDataToUI();
        
        figma.notify('Todo deleted');
    }

    async toggleTodoComplete(id) {
        const todo = this.data.todos.find(todo => todo.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            await this.saveData();
            this.sendDataToUI();
        }
    }

    resizeWindow(width, height) {
        this.data.windowSize = { width, height };
        figma.ui.resize(width, height);
        this.saveData();
    }

    async toggleExpanded() {
        this.data.isExpanded = !this.data.isExpanded;
        await this.saveData();
        this.sendDataToUI();
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

// Initialize the plugin
new TodoListPlugin();
