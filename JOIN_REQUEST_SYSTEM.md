# Join Request System Documentation

## Overview
The join request system allows users to request membership in chat rooms. Room admins can approve or reject these requests with real-time notifications via Socket.IO.

## How It Works

### 1. User Requests to Join a Room
- User clicks "Join Room" button on [RoomsListPage](Frontend/src/pages/RoomsListPage.jsx)
- This triggers `joinRoom()` from [roomService.js](Frontend/src/services/roomService.js)
- Backend creates a **JoinRequest** document in MongoDB with status: "pending"
- Room admin receives real-time Socket.IO notification "newJoinRequest"
- Frontend button changes to "⏳ Request Pending" state

### 2. Admin Views Pending Requests
- When admin opens the chat room, [RequestNotifications](Frontend/src/components/RequestNotifications.jsx) component displays
- Admin can see:
  - Requester's username
  - Requester's email
  - Request date/time
  - Approve/Reject buttons

### 3. Admin Approves Request
- Admin clicks "Approve" button
- Calls `approveRequest()` endpoint with request ID
- Backend:
  - Finds the JoinRequest document
  - Adds user to room's members array
  - Deletes the JoinRequest document
  - Emits Socket.IO "joinRequestApproved" to the requester
- Requester receives notification and can now access the room
- Request disappears from admin's list

### 4. Admin Rejects Request
- Admin clicks "Reject" button
- Can optionally enter a rejection reason
- Calls `rejectRequest()` endpoint
- Backend:
  - Finds the JoinRequest document
  - Updates status to "rejected"
  - Emits Socket.IO "joinRequestRejected" to requester
- Requester sees "✕ Request Rejected" button
- Request is marked as rejected in DB for record-keeping

## Database Schema

### JoinRequest Model
```javascript
{
  roomId: ObjectId,      // Reference to Room
  userId: ObjectId,      // Reference to User
  username: String,      // Username of requester
  email: String,         // Email of requester
  status: String,        // "pending", "approved", or "rejected"
  createdAt: Date,       // Timestamp
  updatedAt: Date        // Timestamp
}

// Indexes for fast queries:
// - roomId + status (for finding pending requests)
// - userId
// - createdAt (for sorting)
```

## API Endpoints

### Create Join Request
**POST** `/api/rooms/:roomId/join`
- Creates a JoinRequest instead of direct join
- Emits Socket.IO notification to room admin
- Returns: `{ message, request }`

### Get Pending Requests (Admin Only)
**GET** `/api/rooms/:roomId/pending-requests`
- Returns all pending JoinRequests for a room
- Only room creator (admin) can access
- Returns: `{ message, requests: [...] }`

### Approve Request (Admin Only)
**PUT** `/api/rooms/request/:requestId/approve`
- Adds user to room members
- Deletes JoinRequest document
- Emits approval notification to requester
- Returns: `{ message, roomId, userId }`

### Reject Request (Admin Only)
**PUT** `/api/rooms/request/:requestId/reject`
- Updates JoinRequest status to "rejected"
- Can include optional rejection reason in body
- Emits rejection notification to requester
- Returns: `{ message, roomId, userId }`

## Socket.IO Events

### Client → Server
```javascript
socket.emit('register-user', { userId })  // Register user for notifications
```

### Server → Client

#### New Join Request (to admin)
```javascript
socket.on('newJoinRequest', {
  requestId: string,
  roomId: string,
  roomName: string,
  userId: string,
  username: string,
  email: string,
  message: string
})
```

#### Request Approved (to requester)
```javascript
socket.on('joinRequestApproved', {
  roomId: string,
  roomName: string,
  message: string
})
```

#### Request Rejected (to requester)
```javascript
socket.on('joinRequestRejected', {
  roomId: string,
  roomName: string,
  reason: string
})
```

## Frontend Components

### RequestNotifications Component
- **File**: [RequestNotifications.jsx](Frontend/src/components/RequestNotifications.jsx)
- **Props**: 
  - `roomId` (string): The room ID
  - `isAdmin` (boolean): Whether current user is room admin
- **Features**:
  - Shows pending requests badge
  - Lists all pending requests with usernames and emails
  - Approve/Reject buttons with confirmation
  - Auto-refreshes list after approval/rejection
  - Scrollable list with custom scrollbar styling

### RoomsListPage Updates
- Shows request status on join buttons
- States:
  - "Join Room" - Ready to request
  - "⏳ Request Pending" - Waiting for admin response
  - "✕ Request Rejected" - Request was rejected
  - "Open Chat" - Already a member

## Frontend Services

### requestService.js
Handles all request-related API calls:
- `getPendingRequests(roomId)` - Fetch pending requests for a room
- `approveRequest(requestId)` - Approve a join request
- `rejectRequest(requestId, reason)` - Reject a join request with optional reason

### socketService.js
New event listeners added:
- `onNewJoinRequest(callback)` - Listen for new requests
- `onRequestApproved(callback)` - Listen for approvals
- `onRequestRejected(callback)` - Listen for rejections

## Security & Validation

1. **Authentication Required**
   - All endpoints require valid JWT token via `protect` middleware

2. **Admin Verification**
   - `approveRequest` and `rejectRequest` verify user is room creator
   - Returns 403 Forbidden if non-admin attempts operation

3. **Duplicate Prevention**
   - System checks for existing pending request before creating new one
   - Returns error if user already has pending request for same room

4. **Member Check**
   - Prevents requesting to join if already a member
   - Returns error if user is already in room.members array

## Flow Diagram

```
User → Click "Join Room"
  ↓
Backend creates JoinRequest (status: pending)
  ↓
Socket.IO sends "newJoinRequest" to admin
  ↓
Admin sees notification with "Approve/Reject" buttons
  ↓
┌─────────────────────────────────────┐
│ Admin Action                        │
├──────────────────┬──────────────────┤
│ Click Approve    │ Click Reject     │
├──────────────────┼──────────────────┤
│ Add to members   │ Set status =     │
│ Delete request   │ "rejected"       │
│ Send approval    │ Send rejection   │
│ Socket event     │ Socket event     │
└──────────────────┴──────────────────┘
  ↓                 ↓
User can access  User sees
  room          rejection status
```

## Error Handling

| Scenario | Status | Response |
|----------|--------|----------|
| Room not found | 404 | "Room not found" |
| Request not found | 404 | "Request not found" |
| User not admin | 403 | "Only room admin can..." |
| Already a member | 400 | "You are already a member" |
| Pending request exists | 400 | "You already have a pending..." |
| Missing authentication | 401 | "Unauthorized" |
| Server error | 500 | Error details |

## Testing the System

1. **Create a test room** as User A
2. **Login as User B** in another window
3. **Navigate to rooms**, find User A's room
4. **Click "Join Room"** - Should see "Request Pending"
5. **Switch to User A**, open the chat room
6. **See pending requests** in the top right
7. **Click Approve** - User B can now access room
8. **Verify User B** sees room in members list

## Future Enhancements

- [ ] Bulk approve/reject multiple requests
- [ ] Request history/logs for audit trail
- [ ] Automatic request expiry (e.g., after 7 days)
- [ ] Admin invitation system (proactive room invites)
- [ ] Request notifications in header badge
- [ ] In-app notification center
- [ ] Email notifications to admin for new requests
- [ ] Customizable acceptance/rejection messages
