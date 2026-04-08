import { useState, useEffect } from 'react';
import requestService from '../services/requestService';
import '../styles/RequestNotifications.css';

const RequestNotifications = ({ roomId, isAdmin }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRequests, setShowRequests] = useState(false);

  useEffect(() => {
    if (isAdmin && roomId) {
      fetchPendingRequests();
    }
  }, [roomId, isAdmin]);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const data = await requestService.getPendingRequests(roomId);
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId, username) => {
    try {
      await requestService.approveRequest(requestId);
      setRequests(requests.filter((r) => r._id !== requestId));
      alert(`${username} has been approved to join the room!`);
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request');
    }
  };

  const handleReject = async (requestId, username) => {
    try {
      const reason = prompt('Enter rejection reason (optional):');
      await requestService.rejectRequest(requestId, reason);
      setRequests(requests.filter((r) => r._id !== requestId));
      alert(`${username}'s request has been rejected`);
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request');
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="request-notifications">
      <button
        className="request-toggle-btn"
        onClick={() => setShowRequests(!showRequests)}
      >
        Join Requests {requests.length > 0 && <span className="badge">{requests.length}</span>}
      </button>

      {showRequests && (
        <div className="requests-panel">
          <h3>Pending Join Requests</h3>
          {loading ? (
            <p>Loading requests...</p>
          ) : requests.length === 0 ? (
            <p className="no-requests">No pending requests</p>
          ) : (
            <div className="requests-list">
              {requests.map((request) => (
                <div key={request._id} className="request-card">
                  <div className="request-info">
                    <h4>{request.username}</h4>
                    <p className="request-email">{request.email}</p>
                    <p className="request-time">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="request-actions">
                    <button
                      className="btn-approve"
                      onClick={() => handleApprove(request._id, request.username)}
                    >
                      ✓ Approve
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => handleReject(request._id, request.username)}
                    >
                      ✕ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RequestNotifications;
