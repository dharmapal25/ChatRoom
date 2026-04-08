const express = require('express');
const {
  createRoom,
  getAllRooms,
  getRoom,
  joinRoom,
  leaveRoom,
  deleteRoom,
  getRoomMessages,
  approveRequest,
  rejectRequest,
  getPendingRequests,
} = require('../controllers/room.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All room routes require authentication
router.use(protect);

// Join request management (admin only) - MORE SPECIFIC, MUST BE FIRST
router.put('/request/:requestId/approve', approveRequest);
router.put('/request/:requestId/reject', rejectRequest);
router.get('/:roomId/pending-requests', getPendingRequests);

// Room management
router.post('/', createRoom);
router.get('/', getAllRooms);
router.get('/:roomId', getRoom);
router.post('/:roomId/join', joinRoom);
router.post('/:roomId/leave', leaveRoom);
router.delete('/:roomId', deleteRoom);

// Messages
router.get('/:roomId/messages', getRoomMessages);

module.exports = router;
