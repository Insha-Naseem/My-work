// Types for the todo list plugin
interface TodoItem {
  id: string;
  description: string;
  priority: 'next-phase' | 'developer-urgent' | '1-2-days' | 'normal';
  completed: boolean;
  commentLink?: string;
  customNote?: string;
  attachment?: {
    type: 'image' | 'link';
    url: string;
    title?: string;
  };
  createdAt: number;
}

interface PluginData {
  todos: TodoItem[];
  windowSize: { width: number; height: number };
  isExpanded: boolean;
}

// Priority configuration
const PRIORITY_CONFIG = {
  'next-phase': { color: '#ff6b6b', label: 'Next Phase' },
  'developer-urgent': { color: '#ff4757', label: 'Developer Urgent' },
  '1-2-days': { color: '#ffa502', label: '1-2 Days' },
  'normal': { color: '#70a1ff', label: 'Normal' }
} as const;

// Default plugin data
const DEFAULT_DATA: PluginData = {
  todos: [],
  windowSize: { width: 320, height: 400 },
  isExpanded: false
};

// Main plugin class
class TodoListPlugin {
  private data: PluginData = DEFAULT_DATA;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
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

  private async loadData(): Promise<void> {
    try {
      const savedData = await figma.clientStorage.getAsync('todoData');
      if (savedData) {
        this.data = Object.assign({}, DEFAULT_DATA, savedData);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      // Continue with default data
    }
  }

  private async saveData(): Promise<void> {
    try {
      await figma.clientStorage.setAsync('todoData', this.data);
    } catch (error) {
      console.error('Failed to save data:', error);
      figma.notify('Failed to save data', { error: true });
    }
  }

  private sendDataToUI(): void {
    console.log('[ts] Sending data to UI:', this.data);
    figma.ui.postMessage({
      type: 'data-update',
      data: this.data
    });
  }

  private handleMessage(message: any): void {
    console.log('[ts] Received message:', message);
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
      case 'clear-all-todos':
        this.clearAllTodos();
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  private async addTodo(todoData: Omit<TodoItem, 'id' | 'createdAt'>): Promise<void> {
    const newTodo: TodoItem = Object.assign(
      {},
      todoData,
      {
        id: this.generateId(),
        createdAt: Date.now()
      }
    );

    this.data.todos.unshift(newTodo); // Add to beginning of array
    await this.saveData();
    this.sendDataToUI();
    
    figma.notify('Todo added successfully');
  }

  private async updateTodo(id: string, updates: Partial<TodoItem>): Promise<void> {
    const todoIndex = this.data.todos.findIndex(todo => todo.id === id);
    if (todoIndex !== -1) {
      this.data.todos[todoIndex] = Object.assign(
        {},
        this.data.todos[todoIndex],
        updates
      );
      await this.saveData();
      this.sendDataToUI();
    }
  }

  private async deleteTodo(id: string): Promise<void> {
    var filtered = this.data.todos.filter(todo => todo.id !== id);
    // await this.saveData();
    // this.sendDataToUI();
    // figma.notify('Todo deleted');
    console.log('[ts] foiltered todos:', filtered);
  }

  private async toggleTodoComplete(id: string): Promise<void> {
    const todo = this.data.todos.find(todo => todo.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      await this.saveData();
      this.sendDataToUI();
    }
  }

  private resizeWindow(width: number, height: number): void {
    this.data.windowSize = { width, height };
    figma.ui.resize(width, height);
    this.saveData();
  }

  private async toggleExpanded(): Promise<void> {
    this.data.isExpanded = !this.data.isExpanded;
    await this.saveData();
    this.sendDataToUI();
  }

  private async clearAllTodos(): Promise<void> {
    console.log('[ts] Clearing all todos');
    this.data.todos = [];
    await this.saveData();
    this.sendDataToUI();
    figma.notify('All todos cleared');
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// Initialize the plugin
new TodoListPlugin();
