import { motion } from 'framer-motion';

const QuickActions = ({ onActionClick }) => {
  const actions = [
    { label: '🏠 Find PG', text: 'Find PG' },
    { label: '📍 Near Me', text: 'Find PGs near my location' },
    { label: '👨 Boys PG', text: 'Show Boys PG' },
    { label: '👩 Girls PG', text: 'Show Girls PG' },
    { label: '💰 Under ₹5000', text: 'Show PG under ₹5000' },
    { label: '💰 Under ₹10000', text: 'Show PG under ₹10000' },
    { label: '⭐ Top Rated', text: 'Show Top Rated PG' },
    { label: '📅 Schedule Visit', text: 'I want to schedule a visit' },
    { label: '📄 My Booking', text: 'Track my booking status' },
    { label: '📞 Contact Owner', text: 'How do I contact an owner?' },
  ];

  const hasPreferences = localStorage.getItem('housynest_chat_prefs');
  if (hasPreferences) {
    actions.unshift({ label: '✨ Personalized For You', text: 'Show me personalized recommendations based on my past searches' });
  }

  return (
    <div className="flex flex-wrap gap-2 mt-4 px-4 pb-2">
      {actions.map((action, index) => (
        <motion.button
          key={index}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: index * 0.04, duration: 0.2 }}
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onActionClick(action.text)}
          className="px-3 py-1 text-[13px] font-medium bg-white hover:bg-[#0D5C63] text-slate-700 hover:text-white border border-slate-200 hover:border-[#0D5C63] rounded-full shadow-sm hover:shadow-md transition-all duration-200 ease-in-out whitespace-nowrap"
        >
          {action.label}
        </motion.button>
      ))}
    </div>
  );
};

export default QuickActions;
