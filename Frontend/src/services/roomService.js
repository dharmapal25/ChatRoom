import API from './api';

// Create a new room
export const createRoom = async (roomData) => {
  try {
    const response = await API.post('/rooms', roomData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create room' };
  }
};

// Get all rooms
export const getAllRooms = async (page = 1, limit = 10, search = '') => {
  try {
    const response = await API.get('/rooms', {
      params: { page, limit, search },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch rooms' };
  }
};

// Get single room
export const getRoom = async (roomId) => {
  try {
    const response = await API.get(`/rooms/${roomId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch room' };
  }
};

// Join a room
export const joinRoom = async (roomId) => {
  try {
    const response = await API.post(`/rooms/${roomId}/join`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to join room' };
  }
};

// Leave a room
export const leaveRoom = async (roomId) => {
  try {
    const response = await API.post(`/rooms/${roomId}/leave`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to leave room' };
  }
};

// Delete a room
export const deleteRoom = async (roomId) => {
  try {
    const response = await API.delete(`/rooms/${roomId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete room' };
  }
};

// Get room messages
export const getRoomMessages = async (roomId, page = 1, limit = 50) => {
  try {
    const response = await API.get(`/rooms/${roomId}/messages`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch messages' };
  }
};
