import React from 'react';

interface AdminNoticeTickerProps {
  noticeText?: string | null;
}

export const AdminNoticeTicker: React.FC<AdminNoticeTickerProps> = ({ noticeText }) => {
  if (!noticeText) return null;

  return (
    <div className="w-full bg-white border-b border-gray-100 py-1.5 overflow-hidden">
      <div className="marquee-container">
        <div className="marquee-content">
          <span className="marquee-text">{noticeText}</span>
        </div>
        <div className="" aria-hidden="true">
          <span className="marquee-text">{noticeText}</span>
        </div>
      </div>
      <style>{`
        .marquee-container {
          display: flex;
          width: 100%;
          overflow: hidden;
        }
        .marquee-content {
          flex-shrink: 0;
          display: flex;
          justify-content: center;
          min-width: 100%;
          animation: scroll-right-to-left 12s linear infinite;
        }
        .marquee-text {
          font-size: 0.875rem;
          white-space: nowrap;
          padding: 0 2rem;
        }
        @keyframes scroll-right-to-left {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
};
