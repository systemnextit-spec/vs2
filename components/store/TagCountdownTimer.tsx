import { useState, useEffect } from 'react';
import { Clock, Timer } from 'lucide-react';

interface TagCountdownTimerProps {
  expiresAt: string;
  tagName?: string;
  compact?: boolean;
}

const getTimeRemaining = (expiresAt: string) => {
  const now = Date.now();
  const end = new Date(expiresAt).getTime();
  const diff = Math.max(0, end - now);
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds, expired: diff <= 0 };
};

const padZero = (n: number) => n.toString().padStart(2, '0');

export const TagCountdownTimer = ({ expiresAt, tagName, compact = false }: TagCountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(() => getTimeRemaining(expiresAt));
  
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = getTimeRemaining(expiresAt);
      setTimeLeft(remaining);
      if (remaining.expired) clearInterval(timer);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [expiresAt]);
  
  if (timeLeft.expired) return null;

  const totalHours = timeLeft.days * 24 + timeLeft.hours;

  // Dynamic colors from tenant CSS variables
  const primaryBg = 'rgb(var(--color-primary-rgb, 34 197 94))';
  const secondaryBg = 'rgb(var(--color-secondary-rgb, 236 72 153))';

  if (compact) {
    return (
      <div className="flex items-center gap-1 text-xs" role="timer" aria-label={`${tagName || 'Tag'} countdown`}>
        <Timer size={12} className="flex-shrink-0 animate-[heartbeat_1.5s_ease-in-out_infinite]" style={{ color: primaryBg }} />
        <div className="flex items-center gap-0.5">
          <span className="font-bold px-1 py-0.5 rounded text-[10px] min-w-[22px] text-center text-white" style={{ backgroundColor: primaryBg }}>
            {padZero(totalHours)}
          </span>
          <span className="font-bold text-[10px]" style={{ color: secondaryBg }}>:</span>
          <span className="font-bold px-1 py-0.5 rounded text-[10px] min-w-[22px] text-center text-white" style={{ backgroundColor: primaryBg }}>
            {padZero(timeLeft.minutes)}
          </span>
          <span className="font-bold text-[10px]" style={{ color: secondaryBg }}>:</span>
          <span className="font-bold px-1 py-0.5 rounded text-[10px] min-w-[22px] text-center text-white" style={{ backgroundColor: primaryBg }}>
            {padZero(timeLeft.seconds)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 sm:gap-2" role="timer" aria-label={`${tagName || 'Tag'} countdown`}>
      <Clock size={16} className="flex-shrink-0 hidden sm:block animate-[heartbeat_1.5s_ease-in-out_infinite]" style={{ color: primaryBg }} />
      
      <div className="flex flex-col items-center">
        <div 
          className="text-white font-bold text-sm sm:text-lg px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg min-w-[36px] sm:min-w-[48px] text-center shadow-sm animate-[heartbeat_1.5s_ease-in-out_infinite]"
          style={{ background: `linear-gradient(to bottom, ${primaryBg}, ${secondaryBg})` }}
        >
          {padZero(totalHours)}
        </div>
        <span className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5 font-medium uppercase">Hours</span>
      </div>
      
      <span className="font-bold text-sm sm:text-lg self-start mt-1 sm:mt-1.5" style={{ color: secondaryBg }}>:</span>
      
      <div className="flex flex-col items-center">
        <div 
          className="text-white font-bold text-sm sm:text-lg px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg min-w-[36px] sm:min-w-[48px] text-center shadow-sm animate-[heartbeat_1.5s_ease-in-out_infinite]"
          style={{ background: `linear-gradient(to bottom, ${primaryBg}, ${secondaryBg})` }}
        >
          {padZero(timeLeft.minutes)}
        </div>
        <span className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5 font-medium uppercase">Mins</span>
      </div>
      
      <span className="font-bold text-sm sm:text-lg self-start mt-1 sm:mt-1.5" style={{ color: secondaryBg }}>:</span>
      
      <div className="flex flex-col items-center">
        <div 
          className="text-white font-bold text-sm sm:text-lg px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg min-w-[36px] sm:min-w-[48px] text-center shadow-sm animate-[heartbeat_1.5s_ease-in-out_infinite]"
          style={{ background: `linear-gradient(to bottom, ${primaryBg}, ${secondaryBg})` }}
        >
          {padZero(timeLeft.seconds)}
        </div>
        <span className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5 font-medium uppercase">Sec</span>
      </div>
    </div>
  );
};

export default TagCountdownTimer;
