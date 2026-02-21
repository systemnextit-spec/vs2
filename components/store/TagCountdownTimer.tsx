import { useState, useEffect } from 'react';

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
  const primaryColor = 'rgb(var(--color-primary-rgb, 0 113 173))';
  const primaryRgbVal = 'var(--color-primary-rgb, 0 113 173)';

  if (compact) {
    return (
      <div className="flex items-center gap-1 text-xs" role="timer" aria-label={`${tagName || 'Tag'} countdown`}>
        <div className="flex items-center gap-0.5">
          <span className="font-bold px-1 py-0.5 rounded text-[10px] min-w-[22px] text-center border" style={{ color: primaryColor, borderColor: primaryColor }}>{padZero(totalHours)}</span>
          <span className="font-bold text-[10px]" style={{ color: primaryColor }}>:</span>
          <span className="font-bold px-1 py-0.5 rounded text-[10px] min-w-[22px] text-center border" style={{ color: primaryColor, borderColor: primaryColor }}>{padZero(timeLeft.minutes)}</span>
          <span className="font-bold text-[10px]" style={{ color: primaryColor }}>:</span>
          <span className="font-bold px-1 py-0.5 rounded text-[10px] min-w-[22px] text-center border" style={{ color: primaryColor, borderColor: primaryColor }}>{padZero(timeLeft.seconds)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5" role="timer" aria-label={`${tagName || 'Tag'} countdown`}>
      {/* Hours */}
      <div className="flex flex-col items-center justify-center w-9 h-9 border-[1.5px] rounded-md bg-white" style={{ borderColor: primaryColor }}>
        <span className="font-bold text-[12px] leading-none mb-0.5" style={{ color: primaryColor }}>{padZero(totalHours)}</span>
        <span className="text-[7px] font-medium leading-none uppercase" style={{ color: primaryColor }}>Hours</span>
      </div>

      {/* Minutes */}
      <div className="flex flex-col items-center justify-center w-9 h-9 border-[1.5px] rounded-md bg-white" style={{ borderColor: primaryColor }}>
        <span className="font-bold text-[12px] leading-none mb-0.5" style={{ color: primaryColor }}>{padZero(timeLeft.minutes)}</span>
        <span className="text-[7px] font-medium leading-none uppercase" style={{ color: primaryColor }}>Mins</span>
      </div>

      {/* Seconds */}
      <div className="flex flex-col items-center justify-center w-9 h-9 border-[1.5px] rounded-md bg-white" style={{ borderColor: primaryColor }}>
        <span className="font-bold text-[12px] leading-none mb-0.5" style={{ color: primaryColor }}>{padZero(timeLeft.seconds)}</span>
        <span className="text-[7px] font-medium leading-none uppercase" style={{ color: primaryColor }}>Sec</span>
      </div>

      {/* Heartbeat dot */}
      <div className="ml-1 flex items-center justify-center">
        <div className="relative flex items-center justify-center w-5 h-5">
          <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: `rgb(${primaryRgbVal})` }} />
          <div className="absolute w-3 h-3 rounded-full opacity-10" style={{ backgroundColor: `rgb(${primaryRgbVal})` }} />
          <div className="relative w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: `rgb(${primaryRgbVal})`, boxShadow: `0 0 8px rgba(${primaryRgbVal} / 0.7)` }} />
        </div>
      </div>
    </div>
  );
};

export default TagCountdownTimer;
