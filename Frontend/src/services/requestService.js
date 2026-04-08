import api from './api';

const requestService = {
  // Get all pending requests for a room (admin only)
  getPendingRequests: async (roomId) => {
    try {
      const response = await api.get(`/rooms/${roomId}/pending-requests`);
      return response.data;
    } catch (error) {
      console.error('Get pending requests error:', error);
      throw error;
    }
  },

  // Approve a join request
  approveRequest: async (requestId) => {
    try {
      const response = await api.put(`/rooms/request/${requestId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Approve request error:', error);
      throw error;
    }
  },

  // Reject a join request
  rejectRequest: async (requestId, reason = '') => {
    try {
      const response = await api.put(`/rooms/request/${requestId}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error('Reject request error:', error);
      throw error;
    }
  },
};

export default requestService;
