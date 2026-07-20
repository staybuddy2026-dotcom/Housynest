import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import { cn } from '../../lib/utils';


const formatText = (text) => {
  if (!text) return null;
  // Convert basic bold (**text**) to bold tags
  const bolded = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  return <div dangerouslySetInnerHTML={{ __html: bolded.replace(/\n/g, '<br />') }} />;
};

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex w-full mt-4 space-x-3 max-w-full px-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-[#0D5C63] flex items-center justify-center mt-1">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}

      <div
        className={cn(
          "px-4 py-3 rounded-2xl max-w-[80%] shadow-sm",
          isUser
            ? "bg-[#0D5C63] text-white rounded-tr-sm"
            : "bg-white border border-slate-100 text-slate-800 rounded-tl-sm"
        )}
      >
        <div className="text-[14px] leading-relaxed wrap-break-word">
          {formatText(message.content)}
        </div>
        <div 
          className={cn(
            "text-[10px] mt-1.5 flex items-center",
            isUser ? "text-[#0D5C63]/30 justify-end" : "text-slate-400"
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center mt-1">
          <User className="w-5 h-5 text-slate-500" />
        </div>
      )}
    </motion.div>
  );
};

export default ChatMessage;
