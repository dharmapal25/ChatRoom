# Chat Rooms Web App - Complete Documentation

## Project Overview
A real-time chat application with authentication, room management, and live messaging using Socket.IO.

---

## System Architecture

### 1. **Authentication System** (Already Implemented ✓)
- User registration and login
- JWT access tokens (15 min expiry, stored in memory)
- Refresh tokens (7 days, stored in httpOnly cookies)
- Password hashing with bcrypt
- Protected routes with PrivateRoute component

### 2. **Chat Rooms Process** (To Be Implemented)

#### Room Creation Flow:
```
User → Create Room Button → Form (room name, description) 
→ Backend creates room in DB → Add user as admin/owner 
→ Redirect to chat room
```

#### Room Joining Flow:
```
User → Browse Rooms List → Click Join Button 
→ Backend adds user to room members 
→ Send notification to room owner (optional)
→ User redirected to chat room
```

#### Real-Time Chat Flow:
```
User types message → Socket.IO emits message 
→ Backend broadcasts to all room members 
→ All connected users receive message in real-time
```

---

## Database Schema

### User Model (Already Exists)
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  createdAt: Date
}
```

### Room Model (To Create)
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  owner: ObjectId (ref: User),
  members: [ObjectId] (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Message Model (To Create)
```javascript
{
  _id: ObjectId,
  roomId: ObjectId (ref: Room),
  userId: ObjectId (ref: User),
  username: String,
  text: String,
  createdAt: Date
}
```

---

## API Endpoints Required

### Room Endpoints
```
POST   /api/rooms              - Create new room
GET    /api/rooms              - Get all rooms
GET    /api/rooms/:id          - Get room details
POST   /api/rooms/:id/join     - Join a room
POST   /api/rooms/:id/leave    - Leave a room
DELETE /api/rooms/:id          - Delete room (admin only)
```

### Message Endpoints
```
GET    /api/rooms/:id/messages - Get room messages
POST   /api/rooms/:id/messages - Create message (via Socket.IO)
```

---

## Frontend Components Structure

### Pages
- `/pages/LoginPage.jsx` - Login (✓ Exists)
- `/pages/RegisterPage.jsx` - Register (✓ Exists)
- `/pages/HomePage.jsx` - Dashboard (✓ Exists)
- `/pages/RoomsListPage.jsx` - Browse all rooms
- `/pages/ChatRoomPage.jsx` - Single room with messages
- `/pages/CreateRoomPage.jsx` - Create new room

### Components
- `/components/PrivateRoute.jsx` - Protected routes (✓ Exists)
- `/components/RoomCard.jsx` - Room preview card
- `/components/MessageList.jsx` - Messages display
- `/components/MessageInput.jsx` - Message input form
- `/components/UserList.jsx` - Room members list

### Context
- `/context/AuthContext.jsx` - User authentication (✓ Exists)
- `/context/SocketContext.jsx` - Socket.IO management

### Services
- `/services/authService.js` - Auth API calls (✓ Exists)
- `/services/api.js` - Axios instance (✓ Exists)
- `/services/roomService.js` - Room API calls
- `/services/socketService.js` - Socket.IO connection

---

## Real-Time Features with Socket.IO

### Socket Events (Client → Server)
```javascript
socket.emit('join-room', { roomId })
socket.emit('leave-room', { roomId })
socket.emit('send-message', { roomId, text })
socket.emit('typing', { roomId, username })
```

### Socket Events (Server → Client)
```javascript
socket.on('message-received', { userId, username, text, createdAt })
socket.on('user-joined', { userId, username })
socket.on('user-left', { userId, username })
socket.on('user-typing', { username })
socket.on('user-stopped-typing', { username })
```

---

## Tech Stack Summary

### Backend
- **Express.js** - REST API framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Socket.IO** - Real-time communication

### Frontend
- **React 19** - UI library
- **React Router 7** - Client-side routing
- **Axios** - HTTP client
- **Socket.IO Client** - WebSocket client
- **Pure CSS** - Styling (no Tailwind)

---

## Installation Instructions

### Backend Setup

#### Step 1: Install Dependencies
```bash
cd d:\Fake\backend
npm install express mongoose jsonwebtoken bcryptjs cookie-parser cors dotenv socket.io
```

**Packages to install:**
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT creation and verification
- `bcryptjs` - Password hashing
- `cookie-parser` - Parse cookies
- `cors` - Cross-origin requests
- `dotenv` - Environment variables
- `socket.io` - Real-time communication

#### Step 2: Verify .env file has all variables
```
MONGODB_URI=mongodb://127.0.0.1:27017/chat-app
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
PORT=3000
NODE_ENV=development
```

#### Step 3: Start backend server
```bash
node server.js
```

---

### Frontend Setup

#### Step 1: Install Dependencies
```bash
cd d:\Fake\Frontend
npm install axios socket.io-client
```

**Packages to install:**
- `axios` - HTTP client (already installed likely)
- `socket.io-client` - Socket.IO client library

#### Step 2: Verify .env.local file
```
VITE_API_URL=http://localhost:3000/api
```

#### Step 3: Start frontend dev server
```bash
npm run dev
```

Server will run on `http://localhost:5173`

---

## File Structure Overview

```
d:\Fake\
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.model.js (✓)
│   │   │   ├── Room.model.js (NEW)
│   │   │   └── Message.model.js (NEW)
│   │   ├── controllers/
│   │   │   ├── auth.controller.js (✓)
│   │   │   ├── room.controller.js (NEW)
│   │   │   └── message.controller.js (NEW)
│   │   ├── routes/
│   │   │   ├── auth.route.js (✓)
│   │   │   ├── room.route.js (NEW)
│   │   │   └── message.route.js (NEW)
│   │   └── middleware/
│   │       └── auth.js (✓)
│   ├── app.js (✓)
│   ├── server.js (✓ - needs Socket.IO setup)
│   └── .env (✓)
│
└── Frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── LoginPage.jsx (✓)
    │   │   ├── RegisterPage.jsx (✓)
    │   │   ├── HomePage.jsx (✓)
    │   │   ├── RoomsListPage.jsx (NEW)
    │   │   ├── ChatRoomPage.jsx (NEW)
    │   │   └── CreateRoomPage.jsx (NEW)
    │   ├── components/
    │   │   ├── PrivateRoute.jsx (✓)
    │   │   ├── RoomCard.jsx (NEW)
    │   │   ├── MessageList.jsx (NEW)
    │   │   ├── MessageInput.jsx (NEW)
    │   │   └── UserList.jsx (NEW)
    │   ├── context/
    │   │   ├── AuthContext.jsx (✓)
    │   │   └── SocketContext.jsx (NEW)
    │   ├── services/
    │   │   ├── api.js (✓)
    │   │   ├── authService.js (✓)
    │   │   ├── roomService.js (NEW)
    │   │   └── socketService.js (NEW)
    │   ├── styles/
    │   │   ├── App.css (✓)
    │   │   ├── RoomsPage.css (NEW)
    │   │   ├── ChatRoom.css (NEW)
    │   │   └── Messages.css (NEW)
    │   ├── App.jsx (✓)
    │   └── main.jsx (✓)
    ├── .env.local (✓)
    └── package.json
```

---

## Development Workflow

### Phase 1: Room Management (Backend First)
1. Create Room model
2. Create room controller (create, get all, get one, join, leave)
3. Create room routes
4. Test with Postman

### Phase 2: Room Management (Frontend)
1. Create RoomsListPage component
2. Create RoomCard component
3. Create CreateRoomPage component
4. Add routes in App.jsx
5. Create roomService.js for API calls

### Phase 3: Socket.IO Setup (Backend)
1. Configure Socket.IO in server.js
2. Handle socket connections
3. Implement message events
4. Implement user join/leave events

### Phase 4: Socket.IO Setup (Frontend)
1. Create SocketContext
2. Create socketService.js
3. Create ChatRoomPage component
4. Create MessageList component
5. Create MessageInput component
6. Integrate Socket.IO in components

### Phase 5: Styling & Polish
1. Create CSS files for all components
2. Responsive design
3. Error handling and loading states

---

## Quick Start Commands

```bash
# Terminal 1 - Start Backend
cd d:\Fake\backend
node server.js

# Terminal 2 - Start Frontend
cd d:\Fake\Frontend
npm run dev

# Then open http://localhost:5173 in browser
```

---

## Testing Checklist

- [ ] User registration works
- [ ] User login works
- [ ] Access token and refresh token mechanism works
- [ ] Protected routes redirect to login
- [ ] Can view rooms list
- [ ] Can create new room
- [ ] Can join existing room
- [ ] Messages appear in real-time
- [ ] Multiple users can chat simultaneously
- [ ] User typing indicators work
- [ ] User joined/left notifications work
- [ ] Can leave room
- [ ] Can delete room (admin only)

---

## Styling Notes

All styling uses **pure CSS only** - no Tailwind. 
Create separate `.css` files for each page/component:
- Use CSS Grid/Flexbox for layouts
- Use CSS variables for colors and spacing
- Mobile-first responsive design
- CSS transitions for smooth animations

---

## Security Checklist

- [ ] JWT tokens validated on every protected route
- [ ] Passwords hashed with bcrypt
- [ ] CORS enabled properly
- [ ] httpOnly cookies for refresh tokens
- [ ] Input validation on backend
- [ ] SQL/NoSQL injection prevention
- [ ] XSS prevention
- [ ] Environment variables not exposed

---

## Notes

✓ = Already implemented
NEW = Need to create

Start with backend Room models and controllers, then move to frontend components. Test each phase before moving to the next.
