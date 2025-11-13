import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in" 
        onClick={onClose}
        aria-labelledby="confirmation-title" 
        role="dialog" 
        aria-modal="true"
    >
      <div 
        className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl p-6 w-full max-w-md animate-scale-in"
        onClick={handleModalContentClick}
      >
        <h2 id="confirmation-title" className="text-xl font-bold text-slate-800 mb-4">{title}</h2>
        <p className="text-slate-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
            <button 
                type="button" 
                onClick={onClose} 
                className="px-4 py-2 bg-slate-200/70 text-slate-800 rounded-md hover:bg-slate-300/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
            >
                Cancel
            </button>
            <button 
                type="button" 
                onClick={onConfirm} 
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors shadow-lg shadow-red-500/30"
            >
                Confirm
            </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
