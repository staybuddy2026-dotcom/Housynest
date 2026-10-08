import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import { cn } from '../../lib/utils';

// **bold** inside a line, rendered as React elements (never as raw HTML).
const renderInline = (line) =>
  line.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') && part.length > 4
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : <Fragment key={i}>{part}</Fragment>
  );

// The assistant answers in Markdown: headings (###), bullets (* / -), dividers (---) and **bold**.
// Built as elements, so text from the model or listings can never inject HTML.
const formatText = (text) => {
  if (!text) return null;
  return text.split('\n').map((rawLine, i) => {
    const line = rawLine.trimEnd();
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) return <hr key={i} className="my-2 border-slate-200" />;
    const heading = line.match(/^\s*#{1,6}\s+(.*)$/);
    if (heading) return <p key={i} className="font-bold text-[#062F26] mt-2">{renderInline(heading[1])}</p>;
    const bullet = line.match(/^(\s*)[*-]\s+(.*)$/);
    if (bullet) {
      return (
        <div key={i} className="flex gap-2" style={{ paddingLeft: bullet[1].length > 0 ? 16 : 0 }}>
          <span>•</span>
          <span>{renderInline(bullet[2])}</span>
        </div>
      );
    }
    if (!line.trim()) return <div key={i} className="h-2" />;
    return <p key={i}>{renderInline(line)}</p>;
  });
};

// Properties the assistant found, linked to their pages.
const PropertyCards = ({ properties }) => (
  <div className="mt-3 space-y-2">
    {properties.map((p) => (
      <Link
        key={p.id}
        to={`/properties/${p.id}`}
        className="flex items-center gap-3 p-2 rounded-xl border border-slate-200 bg-slate-50 hover:border-[#0D5C63]/40 hover:bg-[#F4F9F8] transition-colors"
      >
        {p.image && <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />}
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-[#062F26] truncate">{p.name}</p>
          <p className="text-[11px] text-slate-500 truncate">{[p.locality, p.city].filter(Boolean).join(', ')}</p>
          <p className="text-[12px] font-bold text-[#0D5C63]">
            ₹{Number(p.minPrice).toLocaleString('en-IN')}
            {p.maxPrice > p.minPrice ? ` - ₹${Number(p.maxPrice).toLocaleString('en-IN')}` : ''}
            <span className="font-medium text-slate-400"> /month</span>
          </p>
        </div>
      </Link>
    ))}
  </div>
);

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
        {!isUser && message.properties?.length > 0 && <PropertyCards properties={message.properties} />}
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
