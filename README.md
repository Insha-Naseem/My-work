# Personal Todo List - Figma Plugin

A powerful, personal todo list plugin for Figma that integrates with comments and provides a floating sticky note-style interface for managing your tasks while working in Figma.

## Features

### 🎯 Core Functionality
- **Floating Widget**: Sticky note-style interface that stays visible while working
- **Local Storage**: All data stored locally using Figma's clientStorage
- **Comment Integration**: Direct links to Figma comments for seamless workflow
- **Rich Content**: Support for images and web links as attachments

### 🚨 Priority System
- **Next Phase** (Red #ff6b6b) - High-level planning items
- **Developer Urgent** (Dark Red #ff4757) - Critical development tasks
- **1-2 Days** (Orange #ffa502) - Short-term deadlines
- **Normal** (Blue #70a1ff) - Regular tasks

### ✨ Todo Item Features
- ✅ Checkbox for completion tracking
- 📝 Rich description text
- 🏷️ Color-coded priority badges
- 🔗 Comment links or custom notes
- 📎 Optional attachments (images/web links)
- ⏰ Creation timestamps
- 🗑️ Delete functionality

### 🎨 UI Design
- Clean, modern Figma-style interface
- Responsive layout (320x400px default)
- Expandable/collapsible form
- Smooth animations and transitions
- Professional typography and spacing

## Installation

### For Development
1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the TypeScript code:
   ```bash
   npm run build
   ```
4. In Figma, go to Plugins > Development > Import plugin from manifest
5. Select the `manifest.json` file from this project

### For Production
1. Build the project: `npm run build`
2. Zip all files: `manifest.json`, `code.js`, `ui.html`, `ui.js`
3. Submit to Figma Plugin Marketplace

## Usage

### Adding Todos
1. Click the header to expand the form (if collapsed)
2. Enter a description of your task
3. Select priority level
4. Choose between comment link or custom note
5. Optionally add an attachment (image URL or web link)
6. Click "Add Todo" or press Ctrl+Enter

### Managing Todos
- **Complete**: Check the checkbox to mark as done
- **Delete**: Click the × button to remove a todo
- **Comment Links**: Click to copy Figma comment URLs to clipboard
- **External Links**: Click to open in new tab

### Interface Controls
- **Header Toggle**: Click to expand/collapse the form
- **Clear Form**: Reset all form fields
- **Auto-save**: All changes are saved automatically

## File Structure

```
figma-personal-todo-list/
├── manifest.json      # Plugin configuration
├── code.ts           # Main TypeScript logic
├── ui.html           # User interface HTML
├── ui.js             # Frontend JavaScript
├── tsconfig.json     # TypeScript configuration
├── package.json      # Dependencies and scripts
└── README.md         # This file
```

## Technical Details

### Data Storage
- Uses `figma.clientStorage` for local data persistence
- Stores todos, window size, and UI state
- Automatic saving on all changes

### Message System
- Bidirectional communication between UI and plugin code
- Type-safe message handling
- Real-time UI updates

### Error Handling
- Graceful fallbacks for storage failures
- User-friendly error messages
- Robust data validation

## Development

### Building
```bash
# One-time build
npm run build

# Watch mode for development
npm run watch

# Development mode (build + watch)
npm run dev
```

### TypeScript
The plugin uses TypeScript for type safety and better development experience. The main logic is in `code.ts` and compiles to `code.js`.

### Styling
The UI uses modern CSS with:
- Flexbox layouts
- CSS Grid for complex arrangements
- Custom scrollbars
- Smooth transitions
- Responsive design principles

## Browser Compatibility
- Modern browsers with ES2020 support
- Figma's embedded browser environment
- Local storage capabilities

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly in Figma
5. Submit a pull request

## License
MIT License - see LICENSE file for details

## Support
For issues, feature requests, or questions:
1. Check the existing issues
2. Create a new issue with detailed information
3. Include Figma version and browser details

---

**Note**: This plugin is designed for personal use. All data is stored locally and is not shared with external services.
