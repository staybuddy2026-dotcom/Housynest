import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot } from 'lucide-react';
import ChatWindow from './ChatWindow';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const location = useLocation();

  const isDashboardRoute = location.pathname.startsWith('/owner') || 
                           location.pathname.startsWith('/tenant') || 
                           location.pathname.startsWith('/admin') ||
                           location.pathname.startsWith('/lawyer');

  if (isDashboardRoute) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <ChatWindow onClose={() => setIsOpen(false)} />
        )}
      </AnimatePresence>

      {!isOpen && (
        <div className="fixed bottom-4 right-4 md:right-6 z-9999 flex flex-col items-end">
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="relative mb-4 bg-white px-5 py-2 rounded-xl shadow-xl border border-slate-100 text-sm font-semibold text-slate-700 whitespace-nowrap flex items-center gap-2.5"
              >
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </div>
                Need help finding a PG?
                <div className="absolute -bottom-2 right-5.5 w-3.5 h-4 bg-white border-b border-r border-slate-100 transform rotate-45"></div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => {
              setIsOpen(true);
              setShowTooltip(false);
            }}
            className="relative w-14 h-14 cursor-pointer bg-[#0D5C63] rounded-full shadow-2xl flex items-center justify-center text-white"
          >
            {/* Pulse effect rings */}
            <div className="absolute inset-0 rounded-full border-2 border-[#0D5C63] animate-ping opacity-20"></div>
            <div className="absolute inset-0 rounded-full border-2 border-[#0D5C63] animate-ping opacity-10" style={{ animationDelay: '500ms' }}></div>

            <Bot className="w-7 h-7" />
          </motion.button>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
