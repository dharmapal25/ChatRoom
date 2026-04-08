# Join Request System - Visual Flowcharts

## User Journey Flowchart

```
┌──────────────────────────────────────────────────────────────┐
│                    ROOMS LIST PAGE                           │
│  User A: Room Creator | User B: Guest Looking to Join       │
└──────────────────────────────────────────────────────────────┘
                            │
                    User B sees room
                            │
                            ↓
              ┌─────────────────────────────┐
              │  Room Created by User A     │
              │  [Join Room]  Button        │
              └─────────────────────────────┘
                            │
                    User B clicks button
                            │
                            ↓
    ┌───────────────────────────────────────┐
    │ Send POST /api/rooms/:id/join         │
    │ Backend creates JoinRequest record    │
    │ Status: "pending"                     │
    └───────────────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ↓                               ↓
        User B sees            User A gets notification
      "⏳ Request Pending"     via Socket.IO in real-time
```

## Admin Approval Flow

```
┌────────────────────────────────────────────────────┐
│              USER A (Room Admin)                   │
│        Opens Chat Room for Room A                  │
└────────────────────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────┐
│  RequestNotifications Component Appears         │
│  (Purple "Join Requests" button at top)         │
│                                                  │
│  [Join Requests] 1                              │
│  ─────────────────────────────────────────      │
│  │ jane                                        │
│  │ jane@example.com                           │
│  │ Requested: Dec 20, 2024                    │
│  │ [✓ Approve]  [✕ Reject]                   │
│  └─────────────────────────────────────────    │
└─────────────────────────────────────────────────┘
             │
    User A clicks button
             │
    ┌────────┴────────┐
    ↓                 ↓
┌─────────┐      ┌─────────┐
│ APPROVE │      │ REJECT  │
└────┬────┘      └────┬────┘
     │                │
     ↓                ↓
Backend:         Backend:
- Add to room    - Mark "rejected"
- Delete request - Keep record
- Socket notify  - Socket notify
     │                │
     ↓                ↓
User B sees       User B sees
"Open Chat"       "✕ Request Rejected"
Can enter room    Cannot enter room
```

## Real-time Notification Flow

```
┌─────────────────────────┐
│  User B (Requester)     │
│  Clicks "Join Room"     │
└────────────┬────────────┘
             │
             │ Creates JoinRequest
             ↓
┌──────────────────────────┐
│   Database (MongoDB)     │
│   JoinRequest collection │
│   status: "pending"      │
└────────────┬─────────────┘
             │
             │ Socket.IO Server receives
             │ (via Express route)
             ↓
┌────────────────────────────────────────┐
│  Socket.IO Server on Backend           │
│  Emits: "newJoinRequest"               │
│  Target: `user_${adminUserId}`         │
│  Data: { requestId, roomId, username } │
└────────────┬───────────────────────────┘
             │
             │ Over WebSocket/Polling
             ↓
┌────────────────────────────────────────┐
│  User A's Browser Socket.IO Connection │
│  Listening to: `user_${userId}`        │
│  Receives: newJoinRequest event        │
└────────────┬───────────────────────────┘
             │
             ↓
┌───────────────────────────────────────┐
│ React Component Updates               │
│ RequestNotifications refreshes        │
│ Shows new request in list             │
└───────────────────────────────────────┘
```

## State Transition Diagram

```
                    ┌──────────┐
                    │  START   │
                    └────┬─────┘
                         │
                User clicks "Join Room"
                         │
                         ↓
              ┌──────────────────────┐
              │  JoinRequest Created │
              │  Status: PENDING     │──────────────┐
              └──────────────────────┘              │
                         │                          │
              Both paths require                    │
              admin action                          │
                         │                          │
         ┌───────────────┴───────────────┐          │
         │                               │          │
    Admin Approves              Admin Rejects       │
         │                               │          │
         ↓                               ↓          │
┌──────────────────┐          ┌─────────────────┐  │
│ Add to members   │          │ Update status   │  │
│ Delete request   │          │ REJECTED        │  │
│ Status: APPROVED │          │ Keep record     │  │
└────────┬─────────┘          └────────┬────────┘  │
         │                            │            │
         ↓                            ↓            │
User can enter                  User cannot enter │
   room                         (without new      │
(button shows                    request)         │
"Open Chat")                                      │
         │                            │            │
         └───────────────┬────────────┘            │
                         │                        │
                         ↓                        │
                   ┌──────────┐                   │
                   │   END    │                   │
                   └──────────┘                   │
                        ↑                         │
                        └─────────────────────────┘
                     (Automatic if request
                      not reviewed, or user
                      can request again)
```

## Component Hierarchy

```
App
└── ChatRoomPage
    ├── Header
    ├── RequestNotifications ← Shows requests for admin
    │   └── Request Cards
    │       └── Approve/Reject Buttons
    └── Chat Container
        ├── Messages Area
        └── Message Input

RoomsListPage ← Shows rooms available to join
├── Room Cards
│   └── Join Button (4 states)
│       ├── "Join Room" (default)
│       ├── "⏳ Request Pending" (request sent)
│       ├── "✕ Request Rejected" (denied)
│       └── "Open Chat" (already member)
```

## Data Flow: Request Creation

```
Browser (User B)                Backend Server              Database
        │                              │                      │
        │                              │                      │
    Click                              │                      │
    "Join                              │                      │
     Room"                             │                      │
        │                              │                      │
        ├─ POST /rooms/:id/join ──────→│                      │
        │                              │                      │
        │                         Check if:                   │
        │                    - User exists                     │
        │                    - Room exists                     │
        │                    - Not already member             │
        │                    - No pending request             │
        │                              │                      │
        │                         Create new                   │
        │                        JoinRequest                   │
        │                              ├─────────────────────→│
        │                              │   Insert doc with     │
        │                              │   status: "pending"   │
        │                              │                      │
        │                    Get room admin ID                │
        │                    Emit Socket event                │
        │                    to user_${adminId}               │
        │                              │                      │
        │←─ Response { request } ──────│                      │
        │                              │                      │
    Update button                      │                      │
    to "Pending"                       │                      │
        │                              │                      │
    Socket.IO                          │                      │
    Connected                          │                      │
        │                              │                      │
        │←─ Socket "newJoinRequest" ──│ ← Only to admin      │
        │                              │                      │
    Update UI                          │                      │
    show badge                         │                      │
        │
```

## API Request/Response Diagram

### Join Room Request
```
┌─ Browser (User B) ──────────────────┐
│                                      │
│  POST /api/rooms/65abc/join          │
│  Authorization: Bearer <token>       │
│  Content-Type: application/json      │
│  { }                                 │
│                                      │
└──────────────┬──────────────────────┘
               │
               │ (HTTP)
               ↓
┌─ Express Server ─────────────────────┐
│  Route: POST /rooms/:roomId/join     │
│  Middleware: protect (verify JWT)    │
│  Controller: joinRoom()              │
│                                      │
│  1. Get user from token              │
│  2. Find room in DB                  │
│  3. Check if already member          │
│  4. Check for pending request        │
│  5. Create JoinRequest doc           │
│  6. Emit Socket.IO event             │
│                                      │
└──────────────┬──────────────────────┘
               │
               │ (JSON Response)
               ↓
┌─ Browser (User B) ──────────────────┐
│                                      │
│  201 Created                         │
│  {                                   │
│    "message": "Join request sent...",│
│    "request": {                      │
│      "_id": "req123",                │
│      "roomId": "65abc",              │
│      "userId": "user2",              │
│      "username": "jane",             │
│      "email": "jane@example.com",    │
│      "status": "pending",            │
│      "createdAt": "2024-12-20..."    │
│    }                                 │
│  }                                   │
│                                      │
└──────────────────────────────────────┘
```

### Approval Request
```
┌─ Browser (Admin) ─────────────────────────┐
│                                            │
│  PUT /api/rooms/request/req123/approve    │
│  Authorization: Bearer <admin-token>      │
│  Content-Type: application/json           │
│  { }                                       │
│                                            │
└──────────────┬─────────────────────────────┘
               │
               │ (HTTP)
               ↓
┌─ Express Server ──────────────────────────┐
│  Route: PUT /request/:requestId/approve   │
│  Middleware: protect (verify JWT)         │
│  Controller: approveRequest()             │
│                                           │
│  1. Get admin user from token             │
│  2. Find JoinRequest (req123)             │
│  3. Find Room                             │
│  4. Verify admin is creator               │
│  5. Add user to room.members              │
│  6. Delete JoinRequest                    │
│  7. Emit Socket.IO to requester           │
│                                           │
└──────────────┬─────────────────────────────┘
               │
               │ (JSON Response)
               ↓
┌─ Browser (Admin) ─────────────────────────┐
│                                            │
│  200 OK                                   │
│  {                                        │
│    "message": "Request approved...",      │
│    "roomId": "65abc",                     │
│    "userId": "user2"                      │
│  }                                        │
│                                            │
│  RequestNotifications updates              │
│  List refreshes, request disappears       │
│                                            │
└────────────────────────────────────────────┘


Additionally, Socket.IO sends to user2:
┌─ Socket.IO Server ────────────────────────┐
│                                            │
│  Emits to: user_${user2}                  │
│  Event: joinRequestApproved               │
│  Payload: {                               │
│    "roomId": "65abc",                     │
│    "roomName": "Chat Room A",             │
│    "message": "Approved!"                 │
│  }                                        │
│                                            │
└────────────────────────────────────────────┘
        │
        │ (WebSocket)
        ↓
┌─ Browser (User B) ───────────────────────┐
│                                           │
│  Receives Socket event                   │
│  Shows notification                      │
│  Updates button to "Open Chat"           │
│  User can now enter room                 │
│                                           │
└────────────────────────────────────────────┘
```

## Architecture Layers

```
┌─────────────────────────────────────────┐
│        PRESENTATION LAYER               │
│  (React Components, CSS, User Interface)│
│                                         │
│  ┌────────────────────────────────────┐ │
│  │  RoomsListPage (Join buttons)      │ │
│  │  ChatRoomPage (Admin panel)        │ │
│  │  RequestNotifications              │ │
│  └────────────────────────────────────┘ │
└────────────────┬────────────────────────┘
                 │
         AJAX / Socket.IO
                 │
                 ↓
┌─────────────────────────────────────────┐
│       APPLICATION LAYER                 │
│  (Services, Business Logic)             │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │  roomService.js                    │ │
│  │  requestService.js                 │ │
│  │  socketService.js                  │ │
│  │  authService.js                    │ │
│  └────────────────────────────────────┘ │
└────────────────┬────────────────────────┘
                 │
            HTTP API
                 │
                 ↓
┌─────────────────────────────────────────┐
│          API LAYER                      │
│  (Express Routes, Middleware)           │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │  room.route.js                     │ │
│  │  - POST /join                      │ │
│  │  - PUT /request/:id/approve        │ │
│  │  - PUT /request/:id/reject         │ │
│  │  - GET /:id/pending-requests       │ │
│  └────────────────────────────────────┘ │
└────────────────┬────────────────────────┘
                 │
            Database ORM
                 │
                 ↓
┌─────────────────────────────────────────┐
│        BUSINESS LAYER                   │
│  (Controllers, Business Logic)          │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │  room.controller.js                │ │
│  │  - joinRoom()                      │ │
│  │  - approveRequest()                │ │
│  │  - rejectRequest()                 │ │
│  │  - getPendingRequests()            │ │
│  └────────────────────────────────────┘ │
└────────────────┬────────────────────────┘
                 │
           Mongoose ODM
                 │
                 ↓
┌─────────────────────────────────────────┐
│          DATA LAYER                     │
│  (Models, Database)                     │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │  JoinRequest Model (Schema)        │ │
│  │  Room Model                        │ │
│  │  User Model                        │ │
│  │  Message Model                     │ │
│  └────────────────────────────────────┘ │
│                                         │
│  MongoDB Collections                   │
│  - joinrequests                        │
│  - rooms                               │
│  - users                               │
│  - messages                            │
└─────────────────────────────────────────┘
```

## Authentication & Authorization Flow

```
User Login
    │
    ├─→ POST /auth/login
    │   └─→ Verify password
    │   └─→ Generate JWT token
    │   └─→ Return token + refresh token
    │
    ├─→ Frontend stores token
    │   └─→ In memory (access token)
    │   └─→ In httpOnly cookie (refresh token)
    │
    ├─→ AuthContext.login()
    │   └─→ Set user state
    │   └─→ Initialize Socket.IO
    │   └─→ Emit 'register-user' with userId
    │
    └─→ All future requests:
        └─→ Header: Authorization: Bearer {token}
        └─→ Axios interceptor adds automatically
        
When making Join Request:
    │
    ├─→ POST /rooms/:id/join
    │   ├─→ Middleware: protect
    │   │   └─→ Verify JWT signature
    │   │   └─→ Extract user ID
    │   │   └─→ Attach user to req.user
    │   │
    │   └─→ Controller: joinRoom()
    │       └─→ Use req.user.id
    │       └─→ Create JoinRequest
    │
    └─→ Response: { request }

When approving Request (Admin):
    │
    ├─→ PUT /rooms/request/:id/approve
    │   ├─→ Middleware: protect
    │   │   └─→ Verify JWT
    │   │   └─→ Extract user ID
    │   │
    │   └─→ Controller: approveRequest()
    │       ├─→ Get room
    │       ├─→ Check: room.createdBy === req.user.id
    │       │   └─→ If NO: Return 403 Forbidden
    │       │   └─→ If YES: Continue
    │       ├─→ Add user to members
    │       ├─→ Delete JoinRequest
    │       └─→ Emit Socket notification
    │
    └─→ Response: { message, roomId, userId }
```

This visual guide helps understand how all the pieces fit together!
