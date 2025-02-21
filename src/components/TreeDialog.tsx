
'use client'
// app/components/TreeDialog.tsx
import { useEffect, useRef } from 'react';

interface TreeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  isLoading?: boolean;
}

export const TreeDialog: React.FC<TreeDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  isLoading
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-4 w-96">
        <h3 className="text-white text-lg font-semibold mb-4">{title}</h3>
        
        <input
          ref={inputRef}
          type="text"
          className="w-full bg-white/5 border border-white/20 rounded-md p-2 text-white mb-4
                   focus:outline-none focus:border-cyan-500"
          placeholder="Nhập nội dung..."
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isLoading) {
              onConfirm(e.currentTarget.value);
            }
            if (e.key === 'Escape') {
              onClose();
            }
          }}
        />
        
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded-md bg-white/5 text-white hover:bg-white/10
                     border border-white/20 transition-colors"
            onClick={onClose}
            disabled={isLoading}
          >
            Hủy
          </button>
          <button
            className="px-4 py-2 rounded-md bg-cyan-500 text-white hover:bg-cyan-600
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={() => onConfirm(inputRef.current?.value || '')}
            disabled={isLoading}
          >
            {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  );
};