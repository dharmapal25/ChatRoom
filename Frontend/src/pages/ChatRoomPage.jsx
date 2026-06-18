import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaBars, FaMicrophone, FaPaperPlane } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { getRoom, leaveRoom, getRoomMessages } from '../services/roomService';
import {
  joinRoom,
  leaveRoom as socketLeaveRoom,
  sendMessage,
  onMessageReceived,
  onUserJoined,
  onUserLeft,
} from '../services/socketService';
import RequestNotifications from '../components/RequestNotifications';
import '../styles/ChatRoom.css';

export default function ChatRoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [notification, setNotification] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);
  const [showJoinRequests, setShowJoinRequests] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const voiceBaseTextRef = useRef('');

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  // Fetch room details and messages
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get room details
        const roomData = await getRoom(roomId);
        setRoom(roomData.room);

        // Get messages
        const messagesData = await getRoomMessages(roomId);
        setMessages(messagesData.messages);

        // Join room via Socket.IO
        joinRoom(roomId, user._id, user.username);
      } catch (err) {
        setError(err.message || 'Failed to load room');
        console.error('Error loading room:', err);
      } finally {
        setLoading(false);
      }
    };

    if (roomId && user) {
      fetchRoomData();
    }

    return () => {
      // Leave room when component unmounts
      if (roomId && user) {
        socketLeaveRoom(roomId, user._id, user.username);
      }
    };
  }, [roomId, user]);

  // Setup Socket.IO listeners
  useEffect(() => {
    const handleMessageReceived = (data) => {
      // Add message to state - using _id from database
      setMessages((prev) => {
        // Check if message already exists by _id
        const messageExists = prev.some((msg) => msg._id === data._id);

        if (messageExists) {
          return prev; // Skip if already exists
        }

        return [
          ...prev,
          {
            _id: data._id, // Use database _id
            userId: data.userId,
            username: data.username,
            text: data.text,
            createdAt: data.createdAt || new Date(),
          },
        ];
      });
    };

    const handleUserJoined = (data) => {
      setNotification(`${data.username} joined the room`);
      setTimeout(() => setNotification(''), 3000);
    };

    const handleUserLeft = (data) => {
      setNotification(`${data.username} left the room`);
      setTimeout(() => setNotification(''), 3000);
    };

    onMessageReceived(handleMessageReceived);
    onUserJoined(handleUserJoined);
    onUserLeft(handleUserLeft);

    // Cleanup: Remove listeners when component unmounts
    return () => {
      // This prevents duplicate listeners on re-renders
    };
  }, [roomId]);

  // Handle send message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageText.trim()) return;

    try {
      setIsSending(true);
      sendMessage(roomId, user._id, user.username, messageText);
      setMessageText('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleMessageKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleMicClick = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Mic typing is not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;
    voiceBaseTextRef.current = messageText.trimEnd();

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('');
      const baseText = voiceBaseTextRef.current;
      const nextText = `${baseText}${baseText ? ' ' : ''}${transcript}`.slice(0, 1000);
      setMessageText(nextText);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setError('Mic typing failed. Please try again.');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    setError(null);
    setIsListening(true);
    recognition.start();
  };

  // Handle leave room
  const handleLeaveRoom = async () => {
    try {
      await leaveRoom(roomId);
      socketLeaveRoom(roomId, user._id, user.username);
      navigate('/rooms');
    } catch (err) {
      setError(err.message || 'Failed to leave room');
      console.error('Error leaving room:', err);
    }
  };

  if (loading) {
    return (
      <div className="chat-room-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading room...</p>
        </div>
      </div>
    );
  }

  if (error && !room) {
    return (
      <div className="chat-room-page">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={() => navigate('/rooms')} className="button-primary">
            Back to Rooms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-room-page">
      {/* Header */}
      <header className="chat-header">
        <div className="chat-header-left">
          <button 
            onClick={() => navigate('/rooms')} 
            className="button-back"
            title="Back to Rooms"
          >
            Back
          </button>
          <div className="chat-info">
            <h2>{room?.name}</h2>
            <span className="room-members-count">{room?.members.length} members</span>
          </div>
        </div>
        <div className="chat-header-actions">
          <button
            type="button"
            className="chat-menu-toggle"
            aria-label="Open room menu"
            aria-expanded={isChatMenuOpen}
            onClick={() => setIsChatMenuOpen((open) => !open)}
          >
            <FaBars aria-hidden="true" />
          </button>

          {isChatMenuOpen && (
            <div className="chat-menu-panel">
              {room && user._id === room.owner._id && (
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinRequests((open) => !open);
                    setIsChatMenuOpen(false);
                  }}
                >
                  Join Requests
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsMembersOpen(true);
                  setIsChatMenuOpen(false);
                }}
              >
                Members
              </button>
              <button
                type="button"
                className="chat-menu-danger"
                onClick={() => {
                  setShowLeaveConfirm(true);
                  setIsChatMenuOpen(false);
                }}
              >
                Leave Room
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Join Request Notifications (for room admin) */}
      {room && user._id === room.owner._id && (
        <RequestNotifications
          roomId={roomId}
          isAdmin={true}
          isOpen={showJoinRequests}
          onClose={() => setShowJoinRequests(false)}
          showInlineButton={false}
        />
      )}

      {/* Main Content */}
      <div className="chat-container">
        {/* Messages Area */}
        <div className="messages-area">
          {notification && <div className="notification">{notification}</div>}

          {messages.length === 0 ? (
            <div className="empty-messages">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`message ${
                    message.userId === user._id ? 'own-message' : 'other-message'
                  }`}
                >
                  <div className="message-content">
                    <div className="message-header">
                      <strong>{message.username}</strong>
                      <small>
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </small>
                    </div>
                    <p className="message-text">{message.text}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Members Sidebar */}
        {isMembersOpen && (
          <button
            type="button"
            className="members-backdrop"
            aria-label="Close members list"
            onClick={() => setIsMembersOpen(false)}
          />
        )}

        <aside className={`members-sidebar ${isMembersOpen ? 'is-open' : ''}`}>
          <div className="members-header">
            <h3>Members ({room?.members.length})</h3>
            <button
              type="button"
              className="members-close"
              onClick={() => setIsMembersOpen(false)}
              aria-label="Close members list"
            >
              x
            </button>
          </div>
          <div className="members-list">
            {room?.members.map((member) => (
              <div key={member._id} className="member-item">
                <span className="member-avatar">{member.username.charAt(0).toUpperCase()}</span>
                <div className="member-info">
                  <span className="member-name">{member.username}</span>
                  {member._id === room?.owner._id && (
                    <span className="owner-badge">Owner</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Message Input */}
      <footer className="chat-footer">
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSendMessage} className="message-form">
          <div className="message-input-shell">
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleMessageKeyDown}
              placeholder="Type a message..."
              disabled={isSending}
              maxLength="1000"
              rows={1}
            />
            <div className="composer-actions">
              <button
                type="button"
                className={`button-mic ${isListening ? 'is-listening' : ''}`}
                onClick={handleMicClick}
                disabled={isSending}
                aria-label={isListening ? 'Stop mic typing' : 'Start mic typing'}
              >
                <FaMicrophone aria-hidden="true" />
              </button>
              <button
                type="submit"
                className="button-send"
                disabled={isSending || !messageText.trim()}
                aria-label="Send message"
              >
                <FaPaperPlane aria-hidden="true" />
                <span>{isSending ? 'Sending...' : 'Send'}</span>
              </button>
            </div>
          </div>
        </form>
      </footer>

      {showLeaveConfirm && (
        <div className="chat-modal-backdrop" role="dialog" aria-modal="true">
          <div className="chat-modal">
            <h3>Are you sure want to leave this room?</h3>
            <div className="chat-modal-actions">
              <button
                type="button"
                className="button-cancel"
                onClick={() => setShowLeaveConfirm(false)}
              >
                No
              </button>
              <button type="button" className="button-confirm-danger" onClick={handleLeaveRoom}>
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
