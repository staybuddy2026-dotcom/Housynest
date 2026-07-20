import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Send, Bot, Loader2, Mic, MicOff, Globe } from 'lucide-react';
import ChatMessage from './ChatMessage';
import QuickActions from './QuickActions';
import axios from 'axios';

const ChatWindow = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi 👋\n\nI'm HousyNest AI Assistant.\n\nI can help you:\n\n🏠 Find PGs\n📍 Search by location\n💰 Find properties by budget\n⭐ Compare PGs\n📅 Schedule Visits\n📄 Track Bookings\n💳 Payment Help\n❓ Website Support\n\nWhat would you like help with today?",
      timestamp: new Date().toISOString(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // New features state
  const [language, setLanguage] = useState(() => localStorage.getItem('housynest_chat_lang') || 'English');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      // Set language based on selected
      recognitionRef.current.lang = language === 'Hindi' ? 'hi-IN' : (language === 'Gujarati' ? 'gu-IN' : 'en-US');

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(prev => prev + (prev ? ' ' : '') + transcript);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };
    }
  }, [language]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Voice search is not supported in your browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    localStorage.setItem('housynest_chat_lang', lang);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (text) => {
    const messageText = text || inputValue;
    if (!messageText.trim()) return;

    const newUserMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Get past searches for personalization
      const pastSearches = JSON.parse(localStorage.getItem('housynest_chat_prefs') || 'null');

      const response = await axios.post('/api/v1/chat/message', {
        message: messageText,
        history: messages.slice(1).map(m => ({ role: m.role, content: m.content })),
        language: language,
        pastSearches: pastSearches
      }, {
        withCredentials: true // send httponly cookies
      });

      const newAssistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.reply,
        timestamp: new Date().toISOString(),
      };

      // Save extracted preferences for personalized recommendations
      if (response.data.extractedPreferences) {
        localStorage.setItem('housynest_chat_prefs', JSON.stringify(response.data.extractedPreferences));
      }

      setMessages((prev) => [...prev, newAssistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-24 right-4 md:right-6 md:bottom-28 bg-white rounded-2xl shadow-2xl p-4 flex items-center justify-between gap-4 cursor-pointer z-50 border border-slate-100"
        onClick={() => setIsMinimized(false)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0D5C63] rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">HousyNest AI</h3>
            <p className="text-xs text-slate-500">Tap to expand</p>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
        >
          <X className="w-5 h-5" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.2 }}
      className="fixed bottom-0 right-0 w-full h-dvh md:h-162.5 md:max-h-[calc(100vh-48px)] md:w-100 md:bottom-6 md:right-6 bg-slate-50 flex flex-col md:rounded-2xl shadow-2xl overflow-hidden z-9999 border border-slate-100"
    >
      {/* Header */}
      <div className="bg-[#0D5C63] p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0D5C63] rounded-full"></div>
          </div>
          <div>
            <h2 className="text-white font-semibold text-[15px]">HousyNest AI Assistant</h2>
            <p className="text-emerald-100/80 text-[11px]">Find PGs, Book Visits, Track Bookings</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/80 cursor-pointer"
          >
            <Minus className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/80 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-4">
        {messages.map((msg, index) => (
          <ChatMessage key={msg.id} message={msg} isLast={index === messages.length - 1} />
        ))}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 px-4 mt-4"
          >
            <div className="w-8 h-8 rounded-full bg-[#0D5C63] flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm border border-slate-100 flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions (only show if no other messages besides welcome, or if specifically desired) */}
      {messages.length === 1 && (
        <QuickActions onActionClick={(text) => handleSendMessage(text)} />
      )}

      {/* Input Area */}
      <div className="p-4 bg-white/90 backdrop-blur-sm border-t border-slate-100 shrink-0 relative">
        <div className="flex items-end gap-2 bg-white border border-slate-200 rounded-3xl p-1.5 shadow-sm focus-within:border-[#0D5C63] focus-within:ring-4 focus-within:ring-[#0D5C63]/10 focus-within:shadow-md transition-all duration-300">
          
          {/* Premium Custom Language Selector */}
          <div className="relative flex items-center justify-center pl-1 pb-1">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition-colors group focus:outline-none focus:ring-2 focus:ring-[#0D5C63]/20"
            >
              <Globe className="w-4 h-4 text-slate-500 group-hover:text-[#0D5C63] transition-colors" />
              <span className="font-semibold text-[13px] text-slate-700">
                {language === 'English' ? 'EN' : language === 'Hindi' ? 'HI' : 'GU'}
              </span>
            </button>

            <AnimatePresence>
              {isLangOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full left-0 mb-3 w-32 bg-white border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] rounded-2xl overflow-hidden z-100 py-1"
                >
                  {['English', 'Hindi', 'Gujarati'].map(lang => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLanguage(lang);
                        localStorage.setItem('housynest_chat_lang', lang);
                        setIsLangOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-[13px] transition-colors ${
                        language === lang 
                          ? 'bg-[#0D5C63]/5 text-[#0D5C63] font-semibold' 
                          : 'text-slate-600 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      {lang}
                      {language === lang && <div className="w-1.5 h-1.5 rounded-full bg-[#0D5C63]"></div>}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 max-h-32 min-h-11 bg-transparent resize-none outline-none text-[15px] p-2.5 text-slate-700 placeholder:text-slate-400 scrollbar-hide"
            rows={1}
          />
          
          <div className="flex items-center gap-1.5 mb-0.5 shrink-0 pr-0.5">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleRecording}
              className={`p-2.5 rounded-full transition-colors cursor-pointer shadow-sm ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
              title="Voice Search"
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className="p-2.5 bg-[#0D5C63] hover:bg-[#0A474D] disabled:bg-slate-100 disabled:text-slate-300 text-white rounded-full shadow-sm transition-colors shrink-0"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
            </motion.button>
          </div>
        </div>
        <div className="text-center mt-3 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-medium tracking-wide">
          <Bot className="w-3.5 h-3.5 opacity-70" />
          AI can make mistakes. Verify important information.
        </div>
      </div>
    </motion.div>
  );
};

export default ChatWindow;
