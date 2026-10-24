import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  description,
  confirmText,
  cancelText,
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl shrink-0 ${
            isDestructive ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-[#EFBF04]/10 text-[#EFBF04]'
          }`}>
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-white mb-2">{title}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-6">{description}</p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                {cancelText || t('cancel')}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md ${
                  isDestructive
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : 'bg-[#EFBF04] hover:bg-[#dcae03] text-zinc-950'
                }`}
              >
                {confirmText || t('confirm')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
