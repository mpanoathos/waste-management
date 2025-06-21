import React, { useEffect, useState } from 'react';
import AdminSideNav from './SideNav/adminSideNav';
import { toast } from 'react-toastify';

const AdminReportThreads = () => {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeThread, setActiveThread] = useState(null);

  const fetchThreads = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/report-thread/admin', {
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

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSideNav />
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-3xl font-bold mb-8">User Support Threads</h1>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : threads.length === 0 ? (
          <div className="text-gray-600">No threads found.</div>
        ) : (
          <div className="bg-white rounded shadow">
            <ul>
              {threads.map(thread => (
                <li
                  key={thread.id}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${activeThread && activeThread.id === thread.id ? 'bg-blue-50' : ''}`}
                  onClick={() => setActiveThread(thread)}
                >
                  <div className="font-semibold">{thread.subject}</div>
                  <div className="text-xs text-gray-500">Started: {new Date(thread.createdAt).toLocaleString()}</div>
                  <div className="text-xs text-gray-500">User: {thread.user?.name} ({thread.user?.email})</div>
                  <div className="text-xs text-gray-500">Status: {thread.status}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
        {activeThread && (
          <AdminReportChat thread={activeThread} onClose={() => setActiveThread(null)} />
        )}
      </div>
    </div>
  );
};

const AdminReportChat = ({ thread, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);

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
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg w-full max-w-lg p-6 relative">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>✕</button>
        <h2 className="text-xl font-bold mb-4">Thread: {thread.subject}</h2>
        <div className="h-64 overflow-y-auto border rounded p-2 mb-4 bg-gray-50">
          {loading ? (
            <div>Loading...</div>
          ) : messages.length === 0 ? (
            <div className="text-gray-500">No messages yet.</div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className={`mb-2 flex ${msg.senderRole === 'ADMIN' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-3 py-2 rounded-lg max-w-xs ${msg.senderRole === 'ADMIN' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                  <div className="text-xs font-semibold mb-1">{msg.senderRole}</div>
                  <div>{msg.content}</div>
                  <div className="text-xs text-gray-300 mt-1">{new Date(msg.createdAt).toLocaleString()}</div>
                </div>
              </div>
            ))
          )}
        </div>
        <form onSubmit={sendMessage} className="flex gap-2">
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
    </div>
  );
};

export default AdminReportThreads; 