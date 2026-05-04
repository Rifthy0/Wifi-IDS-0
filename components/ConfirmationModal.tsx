
import React from 'react';
import { XIcon, AlertTriangleIcon } from './icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: 'danger' | 'primary';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmLabel = 'Confirm',
  confirmVariant = 'primary'
}) => {
  if (!isOpen) return null;

  const confirmButtonClass = confirmVariant === 'danger' 
    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
    : 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] animate-fade-in p-4">
      <div className="bg-light-card dark:bg-slate-800 border border-light-border dark:border-slate-700 rounded-lg shadow-2xl w-full max-w-md transform transition-all duration-300">
        <div className="flex justify-between items-center p-4 border-b border-light-border dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <AlertTriangleIcon className="h-5 w-5 text-red-500" />
            <h2 className="text-lg font-bold text-light-text-primary dark:text-white">{title}</h2>
          </div>
          <button onClick={onClose} className="text-light-text-secondary dark:text-slate-500 hover:text-light-text-primary dark:hover:text-white">
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-light-text-secondary dark:text-slate-300 leading-relaxed">
            {message}
          </p>
        </div>
        <div className="flex justify-end space-x-3 p-4 bg-light-bg dark:bg-slate-800/50 rounded-b-lg border-t border-light-border dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-light-text-primary dark:text-slate-300 hover:bg-light-border dark:hover:bg-slate-700 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-md transition-colors shadow-md ${confirmButtonClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
