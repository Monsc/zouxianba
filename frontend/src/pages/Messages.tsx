import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    username: string;
    avatar: string;
  };
  createdAt: Date;
}

interface Conversation {
  id: string;
  participants: {
    id: string;
    username: string;
    handle: string;
    avatar: string;
  }[];
  lastMessage?: {
    content: string;
    createdAt: Date;
  };
  unreadCount: number;
}

export const Messages = () => {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations');
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}/messages`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId) return;

    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
      });
      const message = await response.json();
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderConversationList = () => (
    <div className="conversations-list">
      {conversations.map(conversation => {
        const otherParticipant = conversation.participants.find(p => p.id !== user?.id);
        if (!otherParticipant) return null;

        return (
          <Link
            key={conversation.id}
            to={`/messages/${conversation.id}`}
            className="conversation-item hover-scale"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              borderBottom: '1px solid var(--border-color)',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <img
              src={otherParticipant.avatar}
              alt={otherParticipant.username}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                marginRight: '12px',
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 'bold' }}>{otherParticipant.username}</div>
                {conversation.lastMessage && (
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9em' }}>
                    {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                )}
              </div>
              {conversation.lastMessage && (
                <div
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.9em',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {conversation.lastMessage.content}
                </div>
              )}
            </div>
            {conversation.unreadCount > 0 && (
              <div
                className="notification-badge"
                style={{
                  backgroundColor: 'var(--primary-color)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8em',
                  marginLeft: '8px',
                }}
              >
                {conversation.unreadCount}
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );

  const renderMessages = () => {
    const currentConversation = conversations.find(c => c.id === conversationId);
    const otherParticipant = currentConversation?.participants.find(p => p.id !== user?.id);

    return (
      <div className="messages-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {otherParticipant && (
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <img
              src={otherParticipant.avatar}
              alt={otherParticipant.username}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                marginRight: '12px',
              }}
            />
            <div>
              <div style={{ fontWeight: 'bold' }}>{otherParticipant.username}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9em' }}>
                @{otherParticipant.handle}
              </div>
            </div>
          </div>
        )}

        <div
          className="messages-list"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
          }}
        >
          {messages.map(message => (
            <div
              key={message.id}
              className={`message ${message.sender.id === user?.id ? 'sent' : 'received'} slide-up`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: message.sender.id === user?.id ? 'flex-end' : 'flex-start',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  maxWidth: '70%',
                  padding: '8px 12px',
                  borderRadius: '16px',
                  backgroundColor:
                    message.sender.id === user?.id ? 'var(--primary-color)' : 'var(--hover-color)',
                  color: message.sender.id === user?.id ? 'white' : 'inherit',
                }}
              >
                {message.content}
              </div>
              <div
                style={{
                  fontSize: '0.8em',
                  color: 'var(--text-secondary)',
                  marginTop: '4px',
                }}
              >
                {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={sendMessage}
          style={{
            padding: '16px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            gap: '12px',
          }}
        >
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="input"
            style={{ flex: 1 }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!newMessage.trim()}
          >
            Send
          </button>
        </form>
      </div>
    );
  };

  return (
    <div className="app-container">
      <Header />
      
      <main className="main-content" style={{ height: 'calc(100vh - 120px)' }}>
        {isLoading ? (
          <div className="container" style={{ textAlign: 'center', padding: '32px' }}>
            <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
          </div>
        ) : conversationId ? (
          renderMessages()
        ) : (
          renderConversationList()
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Messages; 