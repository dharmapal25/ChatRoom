const mongoose = require('mongoose');

const joinRequestSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
joinRequestSchema.index({ roomId: 1, status: 1 });
joinRequestSchema.index({ userId: 1 });
joinRequestSchema.index({ createdAt: -1 });

const JoinRequest = mongoose.model('JoinRequest', joinRequestSchema);
module.exports = JoinRequest;
