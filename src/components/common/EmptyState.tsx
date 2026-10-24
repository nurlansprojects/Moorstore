import React from 'react';
import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="w-full py-16 px-4 flex flex-col items-center justify-center text-center">
      <div className="h-16 w-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#EFBF04] mb-4 shadow-inner">
        {icon || <PackageOpen className="h-8 w-8" />}
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-xl bg-[#EFBF04] hover:bg-[#dcae03] text-zinc-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
