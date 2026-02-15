import React from 'react';
import { X, Clock, Sparkles } from 'lucide-react';

export interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  featureName?: string;
}

/**
 * Reusable Coming Soon Modal Component
 * 
 * Usage:
 * ```tsx
 * const [showComingSoon, setShowComingSoon] = useState(false);
 * 
 * <button onClick={() => setShowComingSoon(true)}>Feature</button>
 * 
 * <ComingSoonModal
 *   isOpen={showComingSoon}
 *   onClose={() => setShowComingSoon(false)}
 *   featureName="Marketing Integrations"
 * />
 * ```
 */
export const ComingSoonModal: React.FC<ComingSoonModalProps> = ({
  isOpen,
  onClose,
  title = 'Coming Soon!',
  message,
  featureName,
}) => {
  if (!isOpen) return null;

  const defaultMessage = featureName 
    ? `${featureName} feature is currently under development. We're working hard to bring you this functionality soon!`
    : 'This feature is currently under development. We\'re working hard to bring you this functionality soon!';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        className="relative bg-white rounded-2xl shadow-2xl w-[90%] max-w-[400px] p-4 sm:p-6 animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute to p-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={20} className="text-gray-500" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
              <Clock size={40} className="text-orange-500" />
            </div>
            <div className="absolute -top-1 -right-1">
              <Sparkles size={24} className="text-amber-400" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          {title}
        </h2>

        {/* Feature Name Badge */}
        {featureName && (
          <div className="flex justify-center mb-3">
            <span className="px-3 py-1 bg-orange-100 text-orange-600 text-sm font-medium rounded-full">
              {featureName}
            </span>
          </div>
        )}

        {/* Message */}
        <p className="text-center text-gray-600 text-sm leading-relaxed mb-6">
          {message || defaultMessage}
        </p>

        {/* Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-orange-400 to-amber-500 text-white font-semibold rounded-xl hover:from-orange-500 hover:to-amber-600 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
        >
          Got it!
        </button>
      </div>
    </div>
  );
};

/**
 * Helper hook for using ComingSoonModal
 * 
 * Usage:
 * ```tsx
 * const { showComingSoon, ComingSoonPopup } = useComingSoon();
 * 
 * <button onClick={() => showComingSoon('Marketing Integrations')}>Feature</button>
 * {ComingSoonPopup}
 * ```
 */
export const useComingSoon = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [featureName, setFeatureName] = React.useState<string | undefined>();

  const showComingSoon = (feature?: string) => {
    setFeatureName(feature);
    setIsOpen(true);
  };

  const ComingSoonPopup = (
    <ComingSoonModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      featureName={featureName}
    />
  );

  return { showComingSoon, ComingSoonPopup, isOpen, closeComingSoon: () => setIsOpen(false) };
};

export default ComingSoonModal;
