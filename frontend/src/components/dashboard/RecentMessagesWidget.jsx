import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';

const colors = [
  'bg-teal-100 text-teal-700',
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-orange-100 text-orange-700'
];

const RecentMessagesWidget = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/inquiries/owner', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const inquiries = await response.json();
          // Take top 3 most recent inquiries
          const recent = inquiries.slice(0, 3).map((inq, idx) => {
            const date = new Date(inq.createdAt);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            let timeStr;
            if (date.toDateString() === today.toDateString()) {
              timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
            } else if (date.toDateString() === yesterday.toDateString()) {
              timeStr = 'Yesterday';
            } else {
              timeStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }

            const name = inq.senderId?.fullName || 'Unknown User';
            const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

            return {
              id: inq._id,
              name,
              time: timeStr,
              message: inq.message || 'Sent an inquiry.',
              unread: !inq.isRead,
              initials,
              color: colors[idx % colors.length]
            };
          });
          setMessages(recent);
        }
      } catch (error) {
        console.error("Failed to fetch recent messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] flex flex-col h-full">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-[#062F26]">Recent Messages</h3>
        <Link to="/owner/messages" className="text-xs font-bold text-[#062F26] hover:text-brand-teal transition-colors">
          View All
        </Link>
      </div>
      <div className="flex flex-col p-2 gap-1 flex-1">
        {loading ? (
          <div className="flex-1 flex items-center justify-center min-h-37.5">
            <Icon icon="lucide:loader-2" className="w-6 h-6 animate-spin text-brand-teal" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-37.5 text-slate-400">
            <Icon icon="lucide:message-square" className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm font-medium">No recent messages</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-3 p-3 hover:bg-[#F8F9FA] rounded-xl cursor-pointer transition-colors group">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${msg.color}`}>
                {msg.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold text-[#062F26] truncate">{msg.name}</h4>
                  <span className="text-[10px] font-semibold text-slate-400 shrink-0">{msg.time}</span>
                </div>
                <p className="text-xs text-slate-500 truncate group-hover:text-slate-700 transition-colors">
                  {msg.message}
                </p>
              </div>
              {msg.unread && (
                <div className="w-2 h-2 rounded-full bg-brand-teal shrink-0 mt-2"></div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentMessagesWidget;
