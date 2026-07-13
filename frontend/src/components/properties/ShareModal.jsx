import { useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'react-hot-toast';

const ShareModal = ({ isOpen, onClose, property }) => {
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const propertyUrl = window.location.href;
  const shareText = `Check out ${property?.title} on Housynest!`;

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: 'logos:whatsapp-icon',
      bgColor: 'bg-[#E5F7ED]',
      action: () => {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + propertyUrl)}`, '_blank');
        onClose();
      }
    },
    {
      name: 'Facebook',
      icon: 'logos:facebook',
      bgColor: 'bg-[#EBF1FA]',
      action: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(propertyUrl)}`, '_blank');
        onClose();
      }
    },
    {
      name: 'Twitter / X',
      icon: 'ri:twitter-x-line',
      iconColor: 'text-slate-900',
      bgColor: 'bg-slate-100',
      action: () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(propertyUrl)}`, '_blank');
        onClose();
      }
    },
    {
      name: 'Email',
      icon: 'lucide:mail',
      iconColor: 'text-brand-teal',
      bgColor: 'bg-teal-50',
      action: () => {
        window.location.href = `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent('I thought you might be interested in this property: ' + propertyUrl)}`;
        onClose();
      }
    }
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(propertyUrl);
    setIsCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => {
      setIsCopied(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[20px] w-full max-w-[400px] shadow-2xl relative animate-[fadeIn_0.2s_ease-out]">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
        >
          <Icon icon="lucide:x" width="18" />
        </button>

        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-[#EAF5F2] text-brand-teal flex items-center justify-center">
              <Icon icon="lucide:share-2" width="20" className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#062F26]">Share Property</h2>
              <p className="text-xs font-medium text-slate-500 line-clamp-1">{property?.title}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 pt-5 flex flex-col gap-5">
          <div className="grid grid-cols-4 gap-4">
            {shareOptions.map((option, idx) => (
              <button
                key={idx}
                onClick={option.action}
                className="flex flex-col items-center gap-2 group"
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-md ${option.bgColor}`}>
                  <Icon icon={option.icon} width="24" className={option.iconColor || ''} />
                </div>
                <span className="text-[10px] font-bold text-slate-600 tracking-wide text-center">{option.name}</span>
              </button>
            ))}
          </div>

          <div className="relative mt-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-[10px] font-bold uppercase tracking-wider text-slate-400">Or copy link</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-2 overflow-hidden">
              <Icon icon="lucide:link" className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-xs font-medium text-slate-600 truncate">{propertyUrl}</span>
            </div>
            <button
              onClick={handleCopyLink}
              className={`flex-shrink-0 h-11 px-4 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                isCopied 
                  ? 'bg-green-500 text-white shadow-md shadow-green-500/20' 
                  : 'bg-[#062F26] text-white hover:-translate-y-0.5 shadow-md shadow-[#062F26]/20'
              }`}
            >
              {isCopied ? (
                <>
                  <Icon icon="lucide:check" width="16" />
                  Copied
                </>
              ) : (
                <>
                  <Icon icon="lucide:copy" width="16" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}} />
    </div>
  );
};

export default ShareModal;
