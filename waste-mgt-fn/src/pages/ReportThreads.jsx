import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import SideNav from './SideNav/SideNav';

const ReportThreads = () => {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [activeThread, setActiveThread] = useState(null);

  const fetchThreads = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/report-thread/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setThreads(data.threads);
      } else {
        setError(data.message || 'Failed to fetch threads');
      }
    } catch {
      setError('Error fetching threads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchThreads(); }, []);

  const handleNewThread = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/report-thread', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subject, message })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Thread created!');
        setSubject('');
        setMessage('');
        setShowNew(false);
        fetchThreads();
      } else {
        toast.error(data.message || 'Failed to create thread');
      }
    } catch {
      toast.error('Error creating thread');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <SideNav />
      <div className="flex flex-1 overflow-hidden">
        {/* Thread List Sidebar */}
        <div className="w-80 bg-white border-r flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h1 className="text-xl font-bold">Support Threads</h1>
            <button
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              onClick={() => setShowNew(!showNew)}
            >
              {showNew ? 'Cancel' : 'New'}
            </button>
          </div>
          {showNew && (
            <form onSubmit={handleNewThread} className="p-4 border-b bg-gray-50">
              <div className="mb-2">
                <label className="block font-semibold mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-2">
                <label className="block font-semibold mb-1">Message</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
              >
                Send
              </button>
            </form>
          )}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4">Loading...</div>
            ) : error ? (
              <div className="p-4 text-red-600">{error}</div>
            ) : threads.length === 0 ? (
              <div className="p-4 text-gray-600">No threads found.</div>
            ) : (
              <ul>
                {threads.map(thread => (
                  <li
                    key={thread.id}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${activeThread && activeThread.id === thread.id ? 'bg-blue-50' : ''}`}
                    onClick={() => setActiveThread(thread)}
                  >
                    <div className="font-semibold truncate">{thread.subject}</div>
                    <div className="text-xs text-gray-500">Started: {new Date(thread.createdAt).toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Status: {thread.status}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {/* Chat Panel */}
        <div className="flex-1 flex flex-col">
          {activeThread ? (
            <ReportChat thread={activeThread} onClose={() => setActiveThread(null)} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-lg">
              Select a thread to view messages
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ReportChat = ({ thread, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = React.useRef(null);

  const fetchMessages = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/report-thread/${thread.id}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setMessages(data.messages);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, [thread.id]);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/report-thread/${thread.id}/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newMsg })
      });
      const data = await response.json();
      if (response.ok) {
        setNewMsg('');
        fetchMessages();
      } else {
        toast.error(data.message || 'Failed to send message');
      }
    } catch {
      toast.error('Error sending message');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white shadow-sm">
        <div>
          <h2 className="text-xl font-bold">Thread: {thread.subject}</h2>
        </div>
        <button className="text-gray-500 hover:text-red-500 text-xl" onClick={onClose}>✕</button>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2 bg-gradient-to-br from-blue-100/40 to-white" style={{ minHeight: '400px' }}>
        {loading ? (
          <div>Loading...</div>
        ) : messages.length === 0 ? (
          <div className="text-gray-500">No messages yet.</div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={msg.id}
              className={`flex items-end ${msg.senderRole === 'USER' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
            >
              <div className={`max-w-xs px-4 py-2 rounded-2xl shadow ${msg.senderRole === 'USER' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border'}`}>
                <div className="text-xs font-semibold mb-1">{msg.senderRole === 'USER' ? 'You' : 'Admin'}</div>
                <div>{msg.content}</div>
                <div className="text-xs text-gray-300 mt-1 text-right">{new Date(msg.createdAt).toLocaleString()}</div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="flex gap-2 p-4 border-t bg-white sticky bottom-0">
        <input
          type="text"
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          className="flex-1 border rounded px-3 py-2"
          placeholder="Type your message..."
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Send</button>
      </form>
    </div>
  );
};

export default ReportThreads; 