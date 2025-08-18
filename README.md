# Code Collab 🚀

A real-time collaborative coding environment where teams can code, chat, and create together seamlessly. Built with modern web technologies for an exceptional developer experience.

![Code Collab](https://img.shields.io/badge/Code-Collab-purple?style=for-the-badge&logo=code)
![React](https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5-blue?style=for-the-badge&logo=typescript)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7.3-green?style=for-the-badge&logo=socket.io)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🎯 Core Functionality
- **Real-time Code Collaboration**: Multiple users can edit code simultaneously with live synchronization
- **Live Chat System**: Built-in chat functionality for team communication
- **Interactive Drawing Board**: Collaborative whiteboard using TLDraw for visual explanations
- **File Management**: Create, edit, rename, and delete files and folders in real-time
- **Multi-language Support**: Syntax highlighting for 100+ programming languages
- **User Presence**: See who's online, typing indicators, and cursor positions

### 🎨 User Experience
- **Modern UI/UX**: Beautiful dark theme with glassmorphism effects
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Customizable Editor**: Adjustable themes, fonts, and syntax highlighting
- **Split-screen Layout**: Resizable panels for optimal workspace organization
- **Full-screen Mode**: Distraction-free coding environment
- **Toast Notifications**: Real-time feedback for user actions

### 🔧 Technical Features
- **WebSocket Real-time Communication**: Instant updates across all connected clients
- **CodeMirror Integration**: Professional-grade code editor with advanced features
- **File System Sync**: Real-time file structure synchronization
- **Room-based Collaboration**: Join specific rooms for focused collaboration
- **Auto-save**: Automatic content saving and recovery
- **Export Functionality**: Download project files as ZIP

## 🏗️ Architecture

### Frontend (React + TypeScript)
```
client/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── editor/         # Code editor components
│   │   ├── chats/          # Chat functionality
│   │   ├── drawing/        # Drawing board components
│   │   ├── sidebar/        # Sidebar navigation
│   │   └── forms/          # Form components
│   ├── context/            # React Context providers
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Page components
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   └── styles/             # Global styles and themes
```

### Backend (Node.js + Express + Socket.IO)
```
server/
├── src/
│   ├── server.ts           # Main server file
│   └── types/              # TypeScript type definitions
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Code-Collab
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd client
   npm install
   
   # Install backend dependencies
   cd ../server
   npm install
   ```

3. **Start the development servers**
   ```bash
   # Start backend server (from server directory)
   npm run dev
   
   # Start frontend server (from client directory)
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000

### Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   # Build images
   docker build -t code-collab-client ./client
   docker build -t code-collab-server ./server
   
   # Run containers
   docker run -p 5173:5173 code-collab-client
   docker run -p 3000:3000 code-collab-server
   ```

## 📦 Dependencies

### Frontend Dependencies
- **React 18.2.0**: UI framework
- **TypeScript 5.4.5**: Type safety
- **Vite 6.2.2**: Build tool and dev server
- **Tailwind CSS 3.4.1**: Utility-first CSS framework
- **Socket.IO Client 4.7.3**: Real-time communication
- **CodeMirror 6.0.1**: Code editor
- **TLDraw 2.1.4**: Drawing board
- **Framer Motion 12.18.1**: Animations
- **React Router DOM 6.22.3**: Client-side routing
- **React Hot Toast 2.4.1**: Toast notifications

### Backend Dependencies
- **Node.js**: Runtime environment
- **Express 4.21.2**: Web framework
- **Socket.IO 4.7.3**: Real-time communication
- **CORS 2.8.5**: Cross-origin resource sharing
- **TypeScript 4.9.5**: Type safety

## 🔌 API Endpoints

### WebSocket Events

#### User Management
- `JOIN_REQUEST`: Join a collaboration room
- `USER_JOINED`: User joined notification
- `USER_DISCONNECTED`: User left notification
- `USER_OFFLINE`: User went offline
- `USER_ONLINE`: User came online

#### File Operations
- `SYNC_FILE_STRUCTURE`: Synchronize file structure
- `FILE_CREATED`: New file created
- `FILE_UPDATED`: File content updated
- `FILE_RENAMED`: File renamed
- `FILE_DELETED`: File deleted
- `DIRECTORY_CREATED`: New directory created
- `DIRECTORY_UPDATED`: Directory updated
- `DIRECTORY_RENAMED`: Directory renamed
- `DIRECTORY_DELETED`: Directory deleted

#### Real-time Features
- `TYPING_START`: User started typing
- `TYPING_PAUSE`: User stopped typing
- `SEND_MESSAGE`: Send chat message
- `RECEIVE_MESSAGE`: Receive chat message
- `DRAWING_UPDATE`: Drawing board updates
- `SYNC_DRAWING`: Synchronize drawing data

## 🎯 Key Components

### Editor Component
- **CodeMirror Integration**: Professional code editing experience
- **Real-time Sync**: Live code synchronization across users
- **Syntax Highlighting**: Support for 100+ programming languages
- **Custom Themes**: Multiple editor themes available
- **Cursor Tracking**: See other users' cursor positions

### Chat System
- **Real-time Messaging**: Instant message delivery
- **Typing Indicators**: See when others are typing
- **Message History**: Persistent chat history
- **User Avatars**: Visual user identification

### Drawing Board
- **TLDraw Integration**: Professional drawing tools
- **Real-time Collaboration**: Multiple users can draw simultaneously
- **Export Options**: Save drawings as images
- **Mobile Support**: Touch-friendly interface

### File Management
- **Tree Structure**: Hierarchical file organization
- **Real-time Updates**: Live file structure synchronization
- **Drag & Drop**: Intuitive file operations
- **Context Menus**: Right-click file operations

## 🎨 UI/UX Features

### Design System
- **Dark Theme**: Eye-friendly dark color scheme
- **Glassmorphism**: Modern glass-like UI elements
- **Responsive Layout**: Adaptive design for all screen sizes
- **Smooth Animations**: Framer Motion powered transitions
- **Custom Icons**: React Icons integration

### User Experience
- **Intuitive Navigation**: Easy-to-use sidebar navigation
- **Keyboard Shortcuts**: Power user shortcuts
- **Auto-save**: Automatic content preservation
- **Error Handling**: Graceful error management
- **Loading States**: Smooth loading experiences

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
PORT=3000
NODE_ENV=development
```

#### Frontend (vite.config.mts)
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  }
})
```

### Build Configuration

#### Frontend Build
```bash
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Code linting
```

#### Backend Build
```bash
npm run build    # TypeScript compilation
npm run start    # Production start
npm run dev      # Development with hot reload
```

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Docker Deployment
1. Build Docker images
2. Configure environment variables
3. Deploy to your preferred container platform

### Manual Deployment
1. Build the frontend: `npm run build`
2. Build the backend: `npm run build`
3. Deploy to your hosting provider

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm test`
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **CodeMirror**: For the excellent code editor
- **TLDraw**: For the collaborative drawing board
- **Socket.IO**: For real-time communication
- **Tailwind CSS**: For the utility-first CSS framework
- **React Community**: For the amazing ecosystem

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

---

**Made with ❤️ by the Code Collab Team**
