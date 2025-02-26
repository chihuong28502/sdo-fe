// components/InputModal.tsx
import { useEffect, useRef } from 'react';

interface InputModalProps {
  isOpen: boolean;
  title: string;
  initialValue?: string;
  onClose: () => void;
  onConfirm: (value: string) => void;
  isLoading?: boolean;
}

export function InputModal({
  isOpen,
  title,
  initialValue = '',
  onClose,
  onConfirm,
  isLoading
}: InputModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.value = initialValue;
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-[#1A1D2D] rounded-xl border border-white/10 shadow-lg w-[400px] max-w-[90vw] p-6">
        <h3 className="text-lg font-medium text-white mb-4">
          {title}
        </h3>

        <input
          ref={inputRef}
          type="text"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 
                   text-white placeholder-white/50
                   focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50
                   transition-colors mb-4"
          placeholder="Nhập nội dung..."
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isLoading) {
              onConfirm(e.currentTarget.value);
            }
            if (e.key === 'Escape') {
              onClose();
            }
          }}
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80
                     hover:bg-white/10 hover:text-white disabled:opacity-50 
                     transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={() => onConfirm(inputRef.current?.value || '')}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500
                     text-white font-medium hover:from-cyan-600 hover:to-blue-600
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all
                     border border-white/10"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Đang xử lý...</span>
              </div>
            ) : (
              'Xác nhận'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}