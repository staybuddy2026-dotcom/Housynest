import { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import EmojiPicker from 'emoji-picker-react';
import { io } from 'socket.io-client';

const TenantMessages = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeChatHistory, setActiveChatHistory] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  const emojiPickerRef = useRef(null);
  const socketRef = useRef(null);
  const activeChatIdRef = useRef(activeChatId);
  const messagesEndRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChatHistory]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onEmojiClick = (emojiObject) => {
    setMessageInput(prevInput => prevInput + emojiObject.emoji);
  };

  useEffect(() => {
    if (!user) return;

    socketRef.current = io('http://localhost:5000');

    socketRef.current.emit('joinUserRoom', user.id || user._id);

    socketRef.current.on('newNotification', (data) => {
      setConversations(prev => prev.map(conv => {
        if (conv.id === data.inquiryId) {
          return {
            ...conv,
            lastMessage: data.message.text,
            time: new Date(data.message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unread: activeChatIdRef.current !== data.inquiryId ? conv.unread + 1 : conv.unread
          };
        }
        return conv;
      }));
    });

    socketRef.current.on('onlineUsersList', (users) => {
      setOnlineUsers(new Set(users));
    });

    socketRef.current.on('userOnline', (userId) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.add(userId);
        return newSet;
      });
    });

    socketRef.current.on('userOffline', (userId) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [user?._id]);

  useEffect(() => {
    const fetchInquiriesAsConversations = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('/api/inquiries/tenant', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          const mappedConversations = data.map(inq => {
            const ownerName = inq.ownerId?.fullName || inq.propertyId?.pgName || 'Property Owner';
            return {
              id: inq._id,
              name: ownerName,
              otherUserId: inq.ownerId?._id,
              initials: ownerName.charAt(0).toUpperCase(),
              avatarColor: 'bg-teal-100 text-teal-700',
              profilePic: inq.ownerId?.profilePic,
              property: inq.propertyId?.pgName || (inq.propertyId?.bhkType ? `${inq.propertyId.bhkType} ${inq.propertyId.propertyCategory}` : inq.propertyId?.propertyCategory) || 'Unknown Property',
              propertyContext: `Subject: ${inq.subject || 'Inquiry'}`,
              lastMessage: inq.message,
              time: new Date(inq.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              date: new Date(inq.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
              unread: inq.unreadCount || 0,
              rawInquiry: inq
            };
          });
          setConversations(mappedConversations);
          if (mappedConversations.length > 0) {
            setActiveChatId(mappedConversations[0].id);
          }
        } else {
          toast.error('Failed to load conversations');
        }
      } catch (err) {
        console.error('Error fetching conversations:', err);
        toast.error('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchInquiriesAsConversations();
  }, []);

  useEffect(() => {
    if (!activeChatId) return;

    setConversations(prev => prev.map(c => c.id === activeChatId ? { ...c, unread: 0 } : c));

    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`/api/messages/${activeChatId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();

          setConversations(prevConvs => {
            const activeChat = prevConvs.find(c => c.id === activeChatId);
            if (!activeChat) return prevConvs;

            const initialMessage = {
              id: activeChat.id + '-1',
              rawId: activeChat.id,
              sender: 'Me',
              initials: 'ME',
              avatarColor: 'bg-slate-100 text-slate-700',
              profilePic: user.profilePic,
              isMe: true,
              text: activeChat.rawInquiry.message,
              time: activeChat.time,
              date: activeChat.date
            };

            const mapped = data.map(message => ({
              id: message._id,
              rawId: message._id,
              sender: message.senderId.fullName,
              initials: message.senderId.fullName.charAt(0).toUpperCase(),
              profilePic: message.senderId.profilePic,
              avatarColor: (message.senderId._id === user.id || message.senderId._id === user._id) ? 'bg-slate-100 text-slate-700' : 'bg-teal-100 text-teal-700',
              isMe: (message.senderId._id === user.id || message.senderId._id === user._id),
              text: message.text,
              time: new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              date: new Date(message.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
            }));

            setActiveChatHistory([initialMessage, ...mapped]);
            return prevConvs;
          });

          // Mark messages as read in the backend
          fetch(`/api/messages/${activeChatId}/read`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
          }).then(() => {
            window.dispatchEvent(new Event('messagesRead'));
          }).catch(err => console.error('Failed to mark read', err));

        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchHistory();

    if (socketRef.current) {
      socketRef.current.emit('joinChatRoom', activeChatId);

      const handleReceiveMessage = (message) => {
        setActiveChatHistory(prev => {
          if (prev.some(m => m.rawId === message._id)) return prev;

          // If message is from the other user, mark it as read immediately since we are in the active chat
          if (message.senderId._id !== user.id && message.senderId._id !== user._id) {
            const token = localStorage.getItem('accessToken');
            fetch(`/api/messages/${activeChatId}/read`, {
              method: 'PUT',
              headers: { 'Authorization': `Bearer ${token}` }
            }).then(() => {
              window.dispatchEvent(new Event('messagesRead'));
            }).catch(console.error);
          }

          return [...prev, {
            id: message._id,
            rawId: message._id,
            sender: message.senderId.fullName,
            initials: message.senderId.fullName.charAt(0).toUpperCase(),
            profilePic: message.senderId.profilePic,
            avatarColor: (message.senderId._id === user.id || message.senderId._id === user._id) ? 'bg-slate-100 text-slate-700' : 'bg-teal-100 text-teal-700',
            isMe: (message.senderId._id === user.id || message.senderId._id === user._id),
            text: message.text,
            time: new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date(message.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
          }];
        });
      };

      socketRef.current.on('receiveMessage', handleReceiveMessage);

      return () => {
        if (socketRef.current) {
          socketRef.current.off('receiveMessage', handleReceiveMessage);
          socketRef.current.emit('leaveChatRoom', activeChatId);
        }
      };
    }
  }, [activeChatId]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeChatId) return;

    try {
      const token = localStorage.getItem('accessToken');
      const text = messageInput.trim();
      setMessageInput(''); // Optimistic clear

      const res = await fetch(`/api/messages/${activeChatId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });

      if (!res.ok) {
        toast.error('Failed to send message');
        setMessageInput(text); // Revert on failure
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to send message');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const activeChat = conversations.find(c => c.id === activeChatId);

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] font-sans">
      {/* Main Split Pane Container */}
      <div className="flex flex-1 overflow-hidden gap-4">

        {/* LEFT COLUMN: Conversation List */}
        <div className="w-[340px] bg-white border border-slate-200 rounded-xl flex flex-col shrink-0 overflow-hidden shadow-sm">
          {/* Search Header */}
          <div className="p-4 border-b border-slate-100 flex items-center gap-2">
            <div className="relative flex-1 group">
              <Icon icon="lucide:search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-teal w-4 h-4 transition-colors" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-sm font-medium outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/10 transition-all placeholder:text-slate-400 text-slate-700 bg-slate-50 focus:bg-white"
              />
            </div>
            <button className="w-[38px] h-[38px] flex items-center justify-center border border-slate-200 rounded-lg text-slate-600 hover:border-brand-teal hover:text-brand-teal transition-all bg-white shrink-0 shadow-sm">
              <Icon icon="lucide:filter" className="w-4 h-4" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
            {loading ? (
              <div className="p-8 text-center text-slate-500 text-sm font-medium flex flex-col items-center justify-center h-full">
                <Icon icon="lucide:loader-2" className="w-6 h-6 animate-spin text-brand-teal mb-3" />
                <p>Loading conversations...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm font-medium flex flex-col items-center justify-center h-full">
                <Icon icon="lucide:inbox" className="w-8 h-8 text-slate-300 mb-3" />
                <p>No conversations yet</p>
              </div>
            ) : conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => setActiveChatId(conv.id)}
                className={`p-4 border-b border-slate-50 cursor-pointer transition-colors relative ${activeChatId === conv.id
                  ? 'bg-[#F4F9F7]'
                  : 'bg-white hover:bg-slate-50'
                  }`}
              >
                {/* Active Indicator Line */}
                {activeChatId === conv.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-teal" />
                )}

                <div className="flex gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden ${conv.avatarColor}`}>
                    {conv.profilePic ? (
                      <img src={conv.profilePic} alt={conv.name} className="w-full h-full object-cover" />
                    ) : (
                      conv.initials
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-[#062F26] truncate">{conv.name}</h3>
                      <span className={`text-xs font-medium shrink-0 ${activeChatId === conv.id ? 'text-brand-teal' : 'text-slate-500'}`}>
                        {conv.time}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-600 truncate mt-0.5">{conv.property}</p>
                    {conv.unread > 0 && (
                      <div className="flex justify-end mt-1.5">
                        <div className="w-5 h-5 rounded-full bg-[#062F26] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                          {conv.unread}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* List Footer */}
          <div className="p-4 border-t border-slate-100 bg-white">
            <p className="text-xs font-medium text-slate-500">
              Showing {conversations.length} conversation{conversations.length !== 1 && 's'}
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN: Active Chat */}
        {activeChat ? (
          <div className="flex-1 bg-white border border-slate-200 rounded-lg flex flex-col shadow-sm overflow-hidden min-w-[500px]">

            {/* Chat Header */}
            <div className="h-[72px] lg:h-[80px] px-4 lg:px-6 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 lg:gap-4">

                <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-sm lg:text-[15px] font-bold shrink-0 overflow-hidden ${activeChat?.avatarColor}`}>
                  {activeChat?.profilePic ? (
                    <img src={activeChat.profilePic} alt={activeChat.name} className="w-full h-full object-cover" />
                  ) : (
                    activeChat?.initials
                  )}
                </div>
                <div>
                  <h2 className="font-bold text-[15px] lg:text-base text-slate-800">{activeChat?.name}</h2>
                  <p className="text-xs font-medium text-slate-500 mt-0.5 truncate max-w-[250px] lg:max-w-[350px]">
                    {activeChat?.property}
                  </p>
                </div>
              </div>

              {/* Header Actions (Status) */}
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${onlineUsers.has(activeChat?.otherUserId) ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                <span className={`text-xs font-medium ${onlineUsers.has(activeChat?.otherUserId) ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {onlineUsers.has(activeChat?.otherUserId) ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>

            {/* Context Banner */}
            <div className="bg-[#EAF5F2] px-4 lg:px-6 py-2.5 flex items-center justify-between border-b border-brand-teal/10 shrink-0">
              <div className="flex items-center gap-2 overflow-hidden">
                <Icon icon="lucide:home" className="w-4 h-4 text-[#062F26] shrink-0" />
                <span className="text-xs lg:text-sm font-bold text-[#062F26] truncate">
                  {activeChat?.propertyContext || activeChat?.property}
                </span>
              </div>
              <button className="text-xs lg:text-xs font-bold text-brand-teal hover:text-[#062F26] shrink-0 ml-4 transition-colors">
                View Details
              </button>
            </div>

            {/* Chat History Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-6 bg-white">

              {/* Date Separator */}
              <div className="flex items-center justify-center">
                <span className="bg-slate-50 text-slate-500 text-xs font-bold px-3 py-1 rounded-full border border-slate-100">
                  {activeChat.date}
                </span>
              </div>

              {/* Privacy/Auto-delete Banner */}
              <div className="flex justify-center mb-2 mt-[-10px]">
                <div className="bg-[#FFF8E7] border border-[#FFE8A1]/60 rounded-xl px-4 py-2.5 flex items-start sm:items-center gap-2.5 max-w-[90%] shadow-sm">
                  <Icon icon="lucide:shield-alert" className="w-4 h-4 text-[#A67C00] shrink-0 mt-0.5 sm:mt-0" />
                  <p className="text-[11.5px] font-semibold text-[#A67C00] leading-snug">
                    For your privacy and security, messages in this chat are automatically deleted after 7 days.
                  </p>
                </div>
              </div>

              {/* Messages Map */}
              {activeChatHistory.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.isMe ? 'justify-end' : 'justify-start'}`}>

                  {/* Avatar for received */}
                  {!msg.isMe && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden ${msg.avatarColor}`}>
                      {msg.profilePic ? (
                        <img src={msg.profilePic} alt={msg.sender} className="w-full h-full object-cover" />
                      ) : (
                        msg.initials
                      )}
                    </div>
                  )}

                  {/* Bubble Container */}
                  <div className={`flex flex-col gap-1 max-w-[70%] ${msg.isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-3 text-sm font-medium leading-relaxed ${msg.isMe
                      ? 'bg-[#EAF5F2] text-[#062F26] rounded-2xl rounded-tr-sm'
                      : 'bg-slate-50 border border-slate-100 text-slate-700 rounded-2xl rounded-tl-sm'
                      }`}>
                      {msg.text}
                    </div>
                    <div className="flex items-center gap-1.5 px-1">
                      <span className="text-xs font-medium text-slate-400">{msg.time}</span>
                      {msg.isMe && (
                        <Icon icon="lucide:check-check" className="w-3.5 h-3.5 text-brand-teal" />
                      )}
                    </div>
                  </div>

                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-100 bg-white shrink-0 relative">

              {/* Emoji Picker Popup */}
              {showEmojiPicker && (
                <div ref={emojiPickerRef} className="absolute bottom-full left-4 mb-2 z-50">
                  <EmojiPicker
                    onEmojiClick={onEmojiClick}
                    searchDisabled={false}
                    skinTonesDisabled={true}
                    width={320}
                    height={400}
                  />
                </div>
              )}

              <div className="flex items-center gap-2 border border-slate-200 rounded-xl bg-white p-2 focus-within:border-brand-teal focus-within:ring-1 focus-within:ring-brand-teal/20 transition-all">

                {/* Action Icons */}
                <div className="flex items-center gap-1 shrink-0 relative">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${showEmojiPicker ? 'bg-brand-teal/10 text-brand-teal' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                      }`}
                  >
                    <Icon icon="lucide:smile" className="w-4 h-4" />
                  </button>
                </div>

                {/* Input Field */}
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400 bg-transparent px-2"
                />

                {/* Send Button */}
                <button onClick={handleSendMessage} className="w-9 h-9 bg-[#062F26] hover:bg-brand-teal text-white rounded-lg flex items-center justify-center transition-colors shadow-sm shrink-0">
                  <Icon icon="lucide:send" className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </div>

          </div>
        ) : (
          <div className="flex-1 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm">
            <div className="text-center">
              <Icon icon="lucide:message-square-dashed" className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-400">Select a conversation to start messaging</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TenantMessages;
